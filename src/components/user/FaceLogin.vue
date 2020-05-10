<template>
  <div class="camera_outer">
    <video
      id="videoCamera"
      :width="videoWidth"
      :height="videoHeight"
      autoplay
    ></video>
    <canvas
      style="display: none;"
      id="canvasCamera"
      :width="videoWidth"
      :height="videoHeight"
    ></canvas>

    <div v-if="imgSrc" class="img_bg_camera">
      <img :src="imgSrc" class="tx_img" />
    </div>
    <el-button type="primary" @click="getCompetence()">打开摄像头</el-button>
    <el-button type="danger" @click="stopNavigator()">关闭摄像头</el-button>
    <el-button type="success" @click="setImage()">人脸登录</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      videoWidth: 800,
      videoHeight: 500,
      imgSrc: '',
      thisCancas: null,
      thisContext: null,
      thisVideo: null
    }
  },
  methods: {
    // 调用权限（打开摄像头功能）
    getCompetence() {
      var _this = this
      this.thisCancas = document.getElementById('canvasCamera')
      this.thisContext = this.thisCancas.getContext('2d')
      this.thisVideo = document.getElementById('videoCamera')
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.getUserMedia
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(
              new Error('getUserMedia is not implemented in this browser')
            )
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          transform: 'scaleX(-1)'
        }
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
          // 旧的浏览器可能没有srcObject
          if ('srcObject' in _this.thisVideo) {
            _this.thisVideo.srcObject = stream
          } else {
            // 避免在新的浏览器中使用它，因为它正在被弃用。
            _this.thisVideo.src = window.URL.createObjectURL(stream)
          }
          _this.thisVideo.onloadedmetadata = function(e) {
            _this.thisVideo.play()
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //  绘制图片（拍照功能）
    setImage() {
      // 点击，canvas画图
      const _this = this
      // _this.videoWidth,_this.videoHeight
      if (this.thisContext === null) {
        this.$message.error('请先打开摄像头')
        return
      }
      this.thisContext.drawImage(
        this.thisVideo, 0, 0, _this.videoWidth, _this.videoHeight
      )
      // 获取图片base64链接
      const image = this.thisCancas.toDataURL('image/png')
      // 定义一个img
      const img = new Image()
      // 设置属性和src
      img.id = 'imgBoxxx'
      img.src = image
      // 将图片添加到页面中
      // document.body.appendChild(img)
      this.dataURLtoFile(image, 'face.png')

      this.uploadImg(img)

      // 下载文件
      // const ADOM = document.createElement('a')
      // console.log(img.src)
      // ADOM.href = img.src
      // ADOM.download = new Date().getTime() + '.jpeg'
      // ADOM.click()
    },
    // base64转文件
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    uploadImg(img) {
      // const formData = new FormData()
      // const file = img
      // formData.append('file', file)
      const imgSrc = this.qs.stringify({
        imgSrc: img.src
      })
      this.$axios
        .post('http://localhost:8081/login/face', imgSrc)
        .then(success => {
          console.log(success)
          if (success.data.code === 200) {
            this.$message.success(success.data.msg)
          } else {
            this.$message.error(success.data.msg)
          }
        })
        .catch(err => {
          this.$message.error('人脸识别失败' + err)
        })
    },
    // 关闭摄像头
    stopNavigator() {
      this.thisVideo.srcObject.getTracks()[0].stop()
    }
  }
}
</script>

<style lang="less" scoped></style>
