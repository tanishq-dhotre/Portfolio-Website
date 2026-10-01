import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const assetBase = import.meta.env.BASE_URL;
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(`${assetBase}draco/`);
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>((resolve, reject) => {
      const load = async () => {
        try {
          const encryptedBlob = await decryptFile(
            `${assetBase}models/character.enc`,
            "Character3D#@"
          );
          const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

          loader.load(
            blobUrl,
            async (gltf) => {
              const character = gltf.scene;
              styleCharacter(character);
              await renderer.compileAsync(character, camera, scene);
              character.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  child.frustumCulled = true;
                }
              });
              resolve(gltf);
              setCharTimeline(character, camera);
              setAllTimeline();
              character.getObjectByName("footR")!.position.y = 3.36;
              character.getObjectByName("footL")!.position.y = 3.36;
              dracoLoader.dispose();
            },
            undefined,
            (error) => {
              console.error("Error loading GLTF model:", error);
              reject(error);
            }
          );
        } catch (err) {
          reject(err);
          console.error(err);
        }
      };

      void load();
    });
  };

  return { loadCharacter };
};

function styleCharacter(character: THREE.Object3D) {
  recolorMesh(character, "BODY.SHIRT", "#d62839");
  recolorMesh(character, "Pant", "#17171b");
  recolorMesh(character, "Shoe", "#f4f4f6");
}

function recolorMesh(
  character: THREE.Object3D,
  name: string,
  color: THREE.ColorRepresentation
) {
  const meshes: THREE.Mesh[] = [];
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  character.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      object.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedName
    ) {
      meshes.push(object);
    }
  });
  const mesh = meshes[0];
  if (!mesh) {
    console.warn(`Character outfit mesh "${name}" was not found.`);
    return;
  }

  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  const recoloredMaterials = materials.map((material) => {
    const clonedMaterial = material.clone();
    if (clonedMaterial instanceof THREE.MeshStandardMaterial) {
      clonedMaterial.color.set(color);
      clonedMaterial.roughness = 0.78;
      clonedMaterial.metalness = 0.05;
    }
    return clonedMaterial;
  });
  mesh.material = Array.isArray(mesh.material)
    ? recoloredMaterials
    : recoloredMaterials[0];
}

export default setCharacter;
