<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img
          src="http://coderblue.cn/images/ayer.png"
          width="46px"
          height="46px"
        />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 isCollapse:true就只有一级菜单的大小，false就是完整大小-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 每次只展开一个或者绑定属性
        :unique-opened="true" collapse-transition:是否开启折叠动画 collapse:是否水平折叠收起菜单
        router:启用了v-router的模式，以index为path跳转
        :default-active:被点击的链接激活状态-->
        <el-menu
          :default-active="$route.path"
          unique-opened
          :router="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + '' + index"
            v-for="(item, index) in menuList"
            :key="item.id"
          >
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <i class="el-icon-menu"></i>
              <span>{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [{ authName: '用户管理', id: 125, order: 1, path: 'users' }],
      // 配置一级菜单图标
      iconsObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-lock',
        101: 'el-icon-shopping-bag-2',
        102: 'el-icon-shopping-cart-full',
        145: 'el-icon-tickets'
      },
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转
      this.$router.push('/login')
    },
    // async getMenuList() {
    //   const { data: res } = await this.$http.get('menus')
    //   if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    //   this.menulist = res.data
    //   console.log(res)
    // }
    getMenuList() {
      this.$axios
        .get('/login?username=admin&&password=123456', {})
        .then(res => {
          this.menuList = [
            {
              authName: '用户管理',
              id: 125,
              order: 1,
              path: 'users',
              children: [
                {
                  authName: '用户列表',
                  id: 225,
                  order: 2,
                  path: 'users'
                }
              ]
            },
            {
              authName: '权限管理',
              id: 103,
              order: 1,
              path: 'rights',
              children: [
                {
                  authName: '角色列表',
                  id: 203,
                  order: 2,
                  path: 'roles'
                },
                {
                  authName: '权限列表',
                  id: 204,
                  order: 2,
<<<<<<< HEAD
                  path: 'powers'
=======
                  path: 'rights'
>>>>>>> login
                }
              ]
            },
            {
              authName: '商品管理',
              id: 101,
              order: 1,
              path: 'goods',
              children: [
                {
                  authName: '商品列表',
                  id: 200,
                  order: 2,
                  path: 'goods'
                },
                {
                  authName: '分类列表',
                  id: 199,
                  order: 2,
                  path: 'classify'
                },
                {
                  authName: '商品分类',
                  id: 198,
                  order: 2,
                  path: 'goodsClass'
                }
              ]
            },
            {
              authName: '订单管理',
              id: 102,
              order: 1,
              path: 'orders',
              children: [
                {
                  authName: '订单列表',
                  id: 202,
                  order: 2,
                  path: 'orders'
                }
              ]
            },
            {
              authName: '数据统计',
              id: 145,
              order: 1,
              path: 'reports',
              children: [
                {
                  authName: '数据报表',
                  id: 245,
                  order: 2,
                  path: 'reports'
                }
              ]
            }
          ]
        })
    },
    // 点击按钮切换菜单的折叠展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  // 流水布局，居中
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;

    > div {
      display: flex;
      color: #fff;
      font-size: 20px;
      align-items: center;

      > span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      // 取消侧边不齐
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    // 每个字间的间隔
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
