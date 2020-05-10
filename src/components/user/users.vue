/* eslint-disable no-useless-return */
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域:Layout栅格布局 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clearable属性即可得到一个可清空的输入框 -->
          <el-input
            clearable
            placeholder="请输入搜索的姓名"
            v-model="queryInfo.name"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="telephone"></el-table-column>
        <el-table-column label="角色" prop="role">
          <template v-slot="scope">
            <div v-if="scope.row.roles !== null">
              {{ scope.row.roles.roleName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status">
          <template v-slot="scope">
            <div>
              <!-- {{ scope.row }}:每一行的json都展示 -->
              <el-switch
                @change="changeStatus(scope.row)"
                inactive-value="0"
                active-value="1"
                v-model="scope.row.status"
              ></el-switch>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <!-- 旧版插槽slot-scope="scope"就可通过scope.row拿到数据 -->
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="showDeleteDialog(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button style="padding: 0px;">
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="showSetRolesDialog(scope.row)"
                ></el-button>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 ，有此id就是修改用户对话框 -->
    <el-dialog
      :title="title"
      @close="addDialogClosed"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addUserForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="telephone">
          <el-input v-model="addUserForm.telephone"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesdialogVisible"
      width="50%"
    >
      <div>
        <p>当前的用户：{{ userInfo.name }}</p>
        <p v-if="userInfo.roles != null">
          当前的角色：{{ userInfo.roles.roleName }}
        </p>
        <p v-else>当前的角色：暂无</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in setRoles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateSetRoles(userInfo.id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+((\.\w+){0,3})@\w+(\.\w{2,3}){1,3}$/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkTelePhone = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regTelePhone = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/
      if (regTelePhone.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        name: '',
        // 当前的页数
        pageNum: 1,
        // 当前每页显示的数据量
        pageSize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      isAddDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRolesdialogVisible: false,
      // 分配角色中的角色下拉框选项信息
      setRoles: [],
      // 分配角色中已选中的角色id值
      selectedRoleId: '',
      // 控制用户对话框的提示信息title
      title: '添加用户',
      // 作为变更用户信息成功与否的信息反馈
      bool: false,
      // 添加用户的表单区域
      addUserForm: {
        id: '',
        name: '',
        password: '',
        email: '',
        telephone: ''
      },
      // 分配角色的对象
      userInfo: [],
      // 添加表单的验证规则对象
      addUserRules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 12,
            message: '用户名的长度在 6 到 12 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        telephone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkTelePhone, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  computed: {},
  methods: {
    search() {
      // 解决不在第一页搜索内容显示为空
      this.queryInfo.pageNum = 1
      this.getUserList()
    },
    getUserList() {
      this.$axios
        .get('http://localhost:8081/users/', {
          params: this.queryInfo
        })
        .then(res => {
          if (res.data.code === 200) {
            this.userList = res.data.data
            for (const item of this.userList) {
              this.statusToString(item)
              this.showRoleName(item)
            }
            this.total = res.data.total
            // 查询完成立即重置搜索框内容
            this.queryInfo.name = ''
          }
        })
    },
    // 监听当前改变页码数
    handleCurrentChange(handleCurrentChange) {
      this.queryInfo.pageNum = handleCurrentChange
      // 重新获取数据
      this.getUserList()
    },
    // 监听当前改变页尺寸数
    handleSizeChange(handleSizeChange) {
      this.queryInfo.pageSize = handleSizeChange
      this.getUserList()
    },
    statusToString(item) {
      item.status = '' + item.status
    },
    showRoleName(item) {
      if (item.role === 0) {
        item.role = '超级管理员'
      }
      if (item.role === 1) {
        item.role = '管理员'
      }
      if (item.role === 2) {
        item.role = '销售'
      }
    },
    changeStatus(userInfo) {
      this.$axios
        .put(
          `http://localhost:8081/users/changeStatus?id=${userInfo.id}&status=${userInfo.status}`
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$message.success('更新状态成功')
            // 重新获取数据
            this.getUserList()
          }
        })
        .catch(err => {
          return this.$message.error(`更新状态失败:${err}`)
        })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 对整个表单进行重置，将所有字段值重置为 [初始值]并移除校验结果
      // this.$refs.addFormRef.resetFields()
      this.resetForm()
    },
    // 点击按钮，添加用户
    addUser() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          if (this.addUserForm.id !== null) {
            this.changeUserFormData()
            this.$message.success('添加成功')
          } else {
            this.$message.success('更新成功')
          }
          // 方式一：但是兼容性不好，在ie浏览器没用
          // var params = new URLSearchParams()
          // // params.append('name', this.addUserForm.name)
          // params.append('userInfo', this.addUserForm)
          // this.$axios
          //   .post('http://localhost:8081/users/add?', params)
          //   .then(response => (this.Datas = response.data.json.userMaps))
        }
      })
    },
    // 展示添加用户的对话框
    showAddDialog() {
      this.editDialogVisible = true
      this.title = '添加用户'
    },
    // 展示编辑用户的对话框
    showEditDialog(userInfo) {
      this.editDialogVisible = true
      this.title = '修改用户'
      this.addUserForm.name = userInfo.name
      this.addUserForm.password = userInfo.password
      this.addUserForm.telephone = userInfo.telephone
      this.addUserForm.email = userInfo.email
      this.addUserForm.id = userInfo.id
    },
    // 重置表单数据
    resetForm() {
      this.addUserForm.name = ''
      this.addUserForm.password = ''
      this.addUserForm.telephone = ''
      this.addUserForm.email = ''
      this.addUserForm.id = ''
    },
    // 用户信息变更操作方法
    changeUserFormData() {
      const params = this.qs.stringify({
        id: this.addUserForm.id,
        name: this.addUserForm.name,
        email: this.addUserForm.email,
        telephone: this.addUserForm.telephone,
        password: this.addUserForm.password
      })
      this.$axios
        .post('http://localhost:8081/users/add', params)
        .then(success => {
          if (success.data.code === 200) {
            this.editDialogVisible = false
            this.bool = true
            this.getUserList()
          }
        })
        .catch(err => {
          this.bool = false
          this.$message.error('添加失败:' + err)
        })
    },
    // 逻辑删除用户
    showDeleteDialog(userId) {
      this.$confirm(`此操作将永久删除该用户：${userId}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .delete('http://localhost:8081/users/delete', {
              params: {
                userId: userId
              }
            })
            .then(success => {
              if (success.data.code === 200) {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.queryInfo.pageNum = 1
                this.getUserList()
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 分配角色
    showSetRolesDialog(userInfo) {
      this.userInfo = userInfo
      this.$axios.get('http://localhost:8081/roles/list').then(res => {
        if (res.data.code === 200) {
          this.setRoles = res.data.data
          // 打开对话框后所有权限树
        }
      })
      this.setRolesdialogVisible = true
    },
    // 提交分配的角色
    updateSetRoles(id) {
      var params = new URLSearchParams()
      params.append('role', this.selectedRoleId)
      params.append('id', id)
      this.$axios
        .put('http://localhost:8081/users/setRoles', params)
        .then(res => {
          if (res.data.code === 200) {
            this.$message.success('分配角色成功')
            this.setRolesdialogVisible = false
            this.getUserList()
          }
        })
    }
  }
}
</script>

<style lang="less" scoped></style>
