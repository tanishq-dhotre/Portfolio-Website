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
              styleCharacter(character, camera);
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

function styleCharacter(
  character: THREE.Object3D,
  camera: THREE.PerspectiveCamera
) {
  const shirt = recolorMesh(character, "BODY.SHIRT", "#d62839");
  if (shirt) addShirtMark(character, shirt, camera);
  recolorMesh(character, "Pant", "#17171b");
  recolorMesh(character, "Shoe", "#f4f4f6");
}

function recolorMesh(
  character: THREE.Object3D,
  name: string,
  color: THREE.ColorRepresentation
): THREE.Mesh | undefined {
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
    return undefined;
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
  return mesh;
}

function addShirtMark(
  character: THREE.Object3D,
  shirt: THREE.Mesh,
  camera: THREE.PerspectiveCamera
) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    console.error("Could not create the canvas for the character shirt mark.");
    return;
  }

  context.canvas.width = 512;
  context.canvas.height = 220;
  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  context.fillRect(28, 18, 456, 184);
  context.fillStyle = "#b51f32";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 82px Arial, sans-serif";
  context.fillText("NIAT", 256, 76);
  context.font = "600 56px Arial, sans-serif";
  context.fillText("NxtWave", 256, 158);

  const texture = new THREE.CanvasTexture(context.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  character.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  shirt.geometry.computeBoundingBox();
  const bounds = shirt.geometry.boundingBox;
  if (!bounds || !shirt.parent) {
    console.warn("Could not position the mark on the character shirt.");
    texture.dispose();
    return;
  }

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const cameraWorldPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraWorldPosition);
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
    camera.getWorldQuaternion(new THREE.Quaternion())
  );
  const localCameraPosition = shirt
    .worldToLocal(cameraWorldPosition.clone());
  const localRight = shirt
    .worldToLocal(cameraWorldPosition.clone().add(cameraRight))
    .sub(localCameraPosition)
    .normalize();
  const chestPoint = center.clone();
  chestPoint.y = bounds.min.y + size.y * 0.83;
  chestPoint.addScaledVector(localRight, size.x * 0.11);
  const targetWorldPosition = shirt.localToWorld(chestPoint);
  const rayDirection = targetWorldPosition
    .clone()
    .sub(cameraWorldPosition)
    .normalize();
  const raycaster = new THREE.Raycaster(cameraWorldPosition, rayDirection);
  const shirtHit = raycaster.intersectObject(shirt, false)[0];
  if (!shirtHit) {
    console.warn("Could not find the shirt surface for the NIAT NxtWave mark.");
    texture.dispose();
    return;
  }

  const markWidth = Math.min(size.x * 0.24, size.y * 0.2);
  const localHitPoint = shirt.worldToLocal(shirtHit.point.clone());
  const localFacing = localCameraPosition
    .clone()
    .sub(localHitPoint)
    .normalize();
  localHitPoint.addScaledVector(localFacing, Math.max(size.x * 0.004, 0.01));
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(markWidth, markWidth * 0.43),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  mark.name = "NIAT NxtWave shirt mark";
  mark.renderOrder = 1;
  mark.position.copy(localHitPoint);
  mark.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), localFacing);
  shirt.add(mark);
}

export default setCharacter;
