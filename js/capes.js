/* eslint no-undef: 0 */
var renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(300, 400)
document.body.appendChild(renderer.domElement)

var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(3, 300 / 400, 1, 10000)
var controls = new THREE.OrbitControls(camera, renderer.domElement)

var geometry = new THREE.BoxGeometry(1, 1, 1)
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
var cube = new THREE.Mesh(geometry, material)

scene.add(cube)

camera.position.set(0, 20, 100)
controls.enableZoom = false
controls.update()

function render () {
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
