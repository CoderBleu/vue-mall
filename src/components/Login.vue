<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt/>
      </div>
      <!-- 登录表单区域 :ref相当于dom返回对象，可以用于重置表格 :model绑定熟悉class- loginForm-->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="reset" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          this.$axios
            .get('/login', {
              params: {
                username: this.loginForm.username,
                password: this.loginForm.password
              }
            })
            .then(res => {
              // console.log(res.data)
              if (res.data.meta.status === 200) {
                this.$message.success(res.data.meta.msg)
                // 1.将登陆成功之后的 token，保存到客户端的 sessionStorage中
                // 1.1项目中除了登录之外的其他API接口，必须在登陆之后才能访问
                // 1.2token只应该在当前网站打开期间生效，所以token保存在 sessionStorage中
                window.sessionStorage.setItem('token', res.data.data.token)
                // 通过编程式导航跳转到后台主页，路由地址是 /home
                this.$router.push('/home')
              } else {
                this.$message.error(res.data.meta.msg)
              }
            })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    // 居中方式
    position: absolute;
    left: 50%;
    top: 50%;
    // 相对于自身长宽移动50%
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    // 添加阴影
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    // 让盒子在底部区域
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    // 盒子溢出，居中处理
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>
