/* eslint no-undef: 0 */
function init() {
  var renderer = new THREE.WebGLRenderer() //{ alpha: true }
  renderer.setSize(300, 400)
  document.body.appendChild(renderer.domElement)

  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(3, 300 / 400, 1, 10000)
  var controls = new THREE.OrbitControls(camera, renderer.domElement)

  camera.position.set(0, 20, 100)
  controls.enableZoom = false
  controls.update()

  scene.add(createPlayerGroup('t'))

  render()
}

function createPlayerGroup(uuid) {
  let headGroup = new THREE.Object3D()
  headGroup.position.x = 0
  headGroup.position.y = 12
  headGroup.position.z = 0
  let box = new THREE.BoxGeometry(8, 8, 8, 8, 8, 8)
  let headMesh = colorFaces(box, opaqueSkinCanvas, skinLayout[version]['head'][0])
  headGroup.add(headMesh)
  if (hasAlpha) {
    box = new THREE.BoxGeometry(9, 9, 9, 8, 8, 8)
    let hatMesh = colorFaces(box, transparentSkinCanvas, skinLayout[version]['head'][1])
    hatMesh && headGroup.add(hatMesh)
  }

  let playerGroup = new THREE.Object3D()
  playerGroup.add(headGroup)

  return playerGroup
}

function render () {
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

init()
