<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe="">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="grade">
          <template v-slot="scope">
            <el-tag v-if="scope.row.grade === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.grade === 1"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: [
        {
          id: 101,
          authName: '商品管理',
          grade: '0',
          pid: 0,
          path: 'goods'
        },
        {
          id: 102,
          authName: '用户管理',
          grade: '1',
          pid: 0,
          path: 'users'
        }
      ]
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获得权限列表
    getRightsList() {
      this.$axios
        .get('http://localhost:8081/powers/list')
        .then(res => {
          if (res.data.code === 200) {
            console.log(res.data)
            this.rightsList = res.data.data
            this.$message.success('查询成功')
          }
        })
        .catch(err => {
          this.$message.error('查询失败:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped></style>
