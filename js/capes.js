/* eslint no-undef: 0 */
const EPSILON = 1e-3

var renderer
var controls
var scene
var camera

/*
 * This was taken from NameMC.com. I didn't want to specify the entire player myself so borrowed it and incorporated
 */
const skinLayout = {head:[{l:{x:16,y:8,w:8,h:8},r:{x:0,y:8,w:8,h:8},u:{x:8,y:0,w:8,h:8},d:{x:16,y:7,w:8,h:-8},f:{x:8,y:8,w:8,h:8},b:{x:24,y:8,w:8,h:8}},{l:{x:48,y:8,w:8,h:8},r:{x:32,y:8,w:8,h:8},u:{x:40,y:0,w:8,h:8},d:{x:48,y:7,w:8,h:-8},f:{x:40,y:8,w:8,h:8},b:{x:56,y:8,w:8,h:8}}],torso:[{l:{x:28,y:20,w:4,h:12},r:{x:16,y:20,w:4,h:12},u:{x:20,y:16,w:8,h:4},d:{x:28,y:19,w:8,h:-4},f:{x:20,y:20,w:8,h:12},b:{x:32,y:20,w:8,h:12}}],armR:[{l:{x:48,y:20,w:4,h:12},r:{x:40,y:20,w:4,h:12},u:{x:44,y:16,w:4,h:4},d:{x:48,y:19,w:4,h:-4},f:{x:44,y:20,w:4,h:12},b:{x:52,y:20,w:4,h:12}}],armRS:[{l:{x:47,y:20,w:4,h:12},r:{x:40,y:20,w:4,h:12},u:{x:44,y:16,w:3,h:4},d:{x:47,y:19,w:3,h:-4},f:{x:44,y:20,w:3,h:12},b:{x:51,y:20,w:3,h:12}}],armL:[{l:{x:43,y:20,w:-4,h:12},r:{x:51,y:20,w:-4,h:12},u:{x:47,y:16,w:-4,h:4},d:{x:51,y:19,w:-4,h:-4},f:{x:47,y:20,w:-4,h:12},b:{x:55,y:20,w:-4,h:12}}],armLS:[{l:{x:43,y:20,w:-4,h:12},r:{x:50,y:20,w:-4,h:12},u:{x:46,y:16,w:-3,h:4},d:{x:49,y:19,w:-3,h:-4},f:{x:46,y:20,w:-3,h:12},b:{x:53,y:20,w:-3,h:12}}],legR:[{l:{x:8,y:20,w:4,h:12},r:{x:0,y:20,w:4,h:12},u:{x:4,y:16,w:4,h:4},d:{x:8,y:19,w:4,h:-4},f:{x:4,y:20,w:4,h:12},b:{x:12,y:20,w:4,h:12}}],legL:[{l:{x:3,y:20,w:-4,h:12},r:{x:11,y:20,w:-4,h:12},u:{x:7,y:16,w:-4,h:4},d:{x:11,y:19,w:-4,h:-4},f:{x:7,y:20,w:-4,h:12},b:{x:15,y:20,w:-4,h:12}}]}

function init () {
  var mainCanvas = document.getElementById('skincape')
  renderer = new THREE.WebGLRenderer({ alpha: true, canvas: mainCanvas })
  renderer.setSize(300, 400)
  document.body.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(32, 300 / 400, 72 - 20, 72 + 20)

  controls = new THREE.OrbitControls(camera, mainCanvas)
  camera.position.set(0, 20, 70)
  controls.enableZoom = false
  controls.update()

  let currentUnixTime = Math.floor(new Date().getTime() / 1000)
  let uuid = mainCanvas.getAttribute('data-uuid')
  let skinImage = new Image()
  skinImage.crossOrigin = ''
  skinImage.src = 'https://crafatar.com/skins/' + uuid
  skinImage.onload = function () {
    let capeImage = new Image()
    capeImage.crossOrigin = ''
    // capeImage.src = 'https://minecraftcapes.co.uk/getCape/' + uuid + '/preview&' + currentUnixTime
    capeImage.src = 'https://crafatar.com/capes/853c80ef3c3749fdaa49938b674adae6'
    capeImage.onload = function () {
      let earImage = new Image()
      earImage.crossOrigin = ''
      // earImage.src = 'https://minecraftcapes.co.uk/getEars/' + uuid + '/preview&' + currentUnixTime
      earImage.src = 'https://crafatar.com/capes/861e3cb80e2e4f53a50ffbd5356fa8c0'
      earImage.onload = function () {
        scene.add(createPlayerGroup(skinImage, capeImage, earImage))
      }
    }
  }

  render()
}

function toCanvas (image) {
  let w = image.width
  let h = image.height

  let canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  let ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h)

  return canvas
}

function hasAlphaLayer (image) {
  let canvas = toCanvas(image)
  let ctx = canvas.getContext('2d')
  let data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let pixels = data.data
  for (let p = 3; p < pixels.length; p += 4) {
    if (pixels[p] !== 255) {
      return true
    }
  }
  return false
}

function createPlayerGroup (skinImage, capeImage, earImage) {
  let skinCanvas = toCanvas(skinImage)
  let hasAlpha = hasAlphaLayer(skinImage)

  let slim = false

  let headGroup = new THREE.Object3D()
  headGroup.position.x = 0
  headGroup.position.y = 12
  headGroup.position.z = 0
  let box = new THREE.BoxGeometry(8, 8, 8, 8, 8, 8)
  let headMesh = colorFaces(box, skinCanvas, skinLayout['head'][0])
  headGroup.add(headMesh)
  if (hasAlpha) {
    box = new THREE.BoxGeometry(9, 9, 9, 8, 8, 8)
    let hatMesh = colorFaces(box, skinCanvas, skinLayout['head'][1])
    hatMesh && headGroup.add(hatMesh)
  }

  let torsoGroup = new THREE.Object3D()
  torsoGroup.position.x = 0
  torsoGroup.position.y = 2
  torsoGroup.position.z = 0
  box = new THREE.BoxGeometry(8 + EPSILON, 12 + EPSILON, 4 + EPSILON, 8, 12, 4)
  let torsoMesh = colorFaces(box, skinCanvas, skinLayout['torso'][0])
  torsoGroup.add(torsoMesh)
  if (hasAlpha) {
    box = new THREE.BoxGeometry(8.5 + EPSILON, 12.5 + EPSILON, 4.5 + EPSILON, 8, 12, 4)
    let jacketMesh = colorFaces(box, skinCanvas, skinLayout['torso'][1])
    jacketMesh && torsoGroup.add(jacketMesh)
  }

  let rightArmGroup = new THREE.Object3D()
  rightArmGroup.position.x = slim ? -5.5 : -6
  rightArmGroup.position.y = 6
  rightArmGroup.position.z = 0
  let rightArmMesh
  if (slim) {
    box = new THREE.BoxGeometry(3, 12, 4, 3, 12, 4).translate(0, -4, 0)
    rightArmMesh = colorFaces(box, skinCanvas, skinLayout['armRS'][0])
  } else {
    box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -4, 0)
    rightArmMesh = colorFaces(box, skinCanvas, skinLayout['armR'][0])
  }
  rightArmGroup.add(rightArmMesh)
  if (hasAlpha) {
    let rightSleeveMesh
    if (slim) {
      box = new THREE.BoxGeometry(3.5 + EPSILON * 4, 12.5 + EPSILON * 4, 4.5 + EPSILON * 4, 3, 12, 4).translate(0, -4, 0)
      rightSleeveMesh = colorFaces(box, skinCanvas, skinLayout['armRS'][1])
    } else {
      box = new THREE.BoxGeometry(4.5 + EPSILON * 4, 12.5 + EPSILON * 4, 4.5 + EPSILON * 4, 4, 12, 4).translate(0, -4, 0)
      rightSleeveMesh = colorFaces(box, skinCanvas, skinLayout['armR'][1])
    }
    rightSleeveMesh && rightArmGroup.add(rightSleeveMesh)
  }

  let leftArmGroup = new THREE.Object3D()
  leftArmGroup.position.x = slim ? 5.5 : 6
  leftArmGroup.position.y = 6
  leftArmGroup.position.z = 0
  let leftArmMesh
  if (slim) {
    box = new THREE.BoxGeometry(3, 12, 4, 3, 12, 4).translate(0, -4, 0)
    leftArmMesh = colorFaces(box, skinCanvas, skinLayout['armLS'][0])
  } else {
    box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -4, 0)
    leftArmMesh = colorFaces(box, skinCanvas, skinLayout['armL'][0])
  }
  leftArmGroup.add(leftArmMesh)
  if (hasAlpha) {
    let leftSleeveMesh
    if (slim) {
      box = new THREE.BoxGeometry(3.5 + EPSILON * 4, 12.5 + EPSILON * 4, 4.5 + EPSILON * 4, 3, 12, 4).translate(0, -4, 0)
      leftSleeveMesh = colorFaces(box, skinCanvas, skinLayout['armLS'][1])
    } else {
      box = new THREE.BoxGeometry(4.5 + EPSILON * 4, 12.5 + EPSILON * 4, 4.5 + EPSILON * 4, 4, 12, 4).translate(0, -4, 0)
      leftSleeveMesh = colorFaces(box, skinCanvas, skinLayout['armL'][1])
    }
    leftSleeveMesh && leftArmGroup.add(leftSleeveMesh)
  }

  let rightLegGroup = new THREE.Object3D()
  rightLegGroup.position.x = -2
  rightLegGroup.position.y = -4
  rightLegGroup.position.z = 0
  box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -6, 0)
  let rightLegMesh = colorFaces(box, skinCanvas, skinLayout['legR'][0])
  rightLegGroup.add(rightLegMesh)
  if (hasAlpha) {
    box = new THREE.BoxGeometry(4.5 + EPSILON * 2, 12.5 + EPSILON * 2, 4.5 + EPSILON * 2, 4, 12, 4).translate(0, -6, 0)
    let rightPantMesh = colorFaces(box, skinCanvas, skinLayout['legR'][1])
    rightPantMesh && rightLegGroup.add(rightPantMesh)
  }

  let leftLegGroup = new THREE.Object3D()
  leftLegGroup.position.x = 2
  leftLegGroup.position.y = -4
  leftLegGroup.position.z = 0
  box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -6, 0)
  let leftLegMesh = colorFaces(box, skinCanvas, skinLayout['legL'][0])
  leftLegGroup.add(leftLegMesh)
  if (hasAlpha) {
    box = new THREE.BoxGeometry(4.5 + EPSILON * 3, 12.5 + EPSILON * 3, 4.5 + EPSILON * 3, 4, 12, 4).translate(0, -6, 0)
    let leftPantMesh = colorFaces(box, skinCanvas, skinLayout['legL'][1])
    leftPantMesh && leftLegGroup.add(leftPantMesh)
  }

  let playerGroup = new THREE.Object3D()
  playerGroup.add(headGroup)
  playerGroup.add(torsoGroup)
  playerGroup.add(rightArmGroup)
  playerGroup.add(leftArmGroup)
  playerGroup.add(rightLegGroup)
  playerGroup.add(leftLegGroup)

  return playerGroup
}

function colorFaces (geometry, canvas, rectangles) {
  if (!rectangles) return null
  let pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
  let f = 0
  let faces = []
  let materials = []
  let materialIndexMap = {}
  let side = THREE.FrontSide
  for (let rect of Object.values(rectangles)) {
    let width = Math.abs(rect.w)
    let height = Math.abs(rect.h)
    let dj = Math.sign(rect.w)
    let di = Math.sign(rect.h)
    for (let y = 0, i = rect.y; y < height; y++, i += di) {
      for (let x = 0, j = rect.x; x < width; x++, j += dj, f += 2) {
        let p = 4 * (i * canvas.width + j)
        let a = pixels[p + 3]
        if (a === 0) {
          side = THREE.DoubleSide
          continue
        }
        let materialIndex = materialIndexMap[a]
        if (typeof materialIndex === 'undefined') {
          materials.push(new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            opacity: a / 255,
            transparent: (a !== 255)
          }))
          materialIndex = materials.length - 1
          materialIndexMap[a] = materialIndex
          if (a !== 255) {
            side = THREE.DoubleSide
          }
        }
        let face1 = geometry.faces[f]
        let face2 = geometry.faces[f + 1]
        face1.color.r = pixels[p] / 255
        face1.color.g = pixels[p + 1] / 255
        face1.color.b = pixels[p + 2] / 255
        face2.color = face1.color
        face1.materialIndex = materialIndex
        face2.materialIndex = materialIndex
        faces.push(face1)
        faces.push(face2)
      }
    }
  }
  if (faces.length === 0) return null
  geometry.faces = faces
  materials.forEach(function (m) {
    m.side = side
  })
  return new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), materials)
}

function render () {
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

init()
