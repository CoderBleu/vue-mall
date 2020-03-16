<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表区域 -->
    <el-table :data="roleList" border stripe @expand-change="expandChange">
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template v-slot="scope">
          <el-row
            :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
            v-for="(item, index) in scope.row.roles"
            :key="item.id + '' + index"
          >
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag>{{ item.authName }}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <!-- 渲染二级权限 -->
              <el-row
                :class="[index === 0 ? '' : 'bdtop', 'vcenter']"
                v-for="(item1, index) in item.children"
                :key="item1.id + '' + index"
              >
                <el-col :span="6">
                  <el-tag type="success">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 新的栅格又被重新分为24份 -->
                <!-- 渲染三级权限 -->
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="(item2, index) in item1.children"
                    :key="item2.id + '' + index"
                  >
                    {{ item2.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300">
        <template v-slot="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            >删除</el-button
          >
          <el-tooltip
            effect="dark"
            content="分配权限"
            placement="top"
            :enterable="false"
          >
            <el-button style="padding: 0px;">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightDialog(scope.row.id)"
                >分配权限</el-button
              >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="分配权限"
      @close="handleClose"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defaultKeys"
        @node-click="handleNodeClick"
      ></el-tree>
      <!-- :default-expanded-keys="defaultKeys" -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRightDialogVisible"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesCloseDialog"
    >
      <el-form
        :model="addRolesRuleForm"
        status-icon
        :rules="addRolesRules"
        ref="addRolesRuleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="addRolesRuleForm.roleName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input
            v-model="addRolesRuleForm.roleDesc"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNewRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addRolesRuleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ]
      },
      roleList: [
        {
          authName: '主管',
          roleDesc: '技术负责人'
        }
      ],
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树型控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值
      defaultKeys: [504, 505, 506],
      // 当前分配角色权限的id
      rolesId: '',
      // 控制添加角色的对话框显示与隐藏
      addRolesDialogVisible: false
    }
  },
  // 加载就调用
  mounted() {
    // this.getPowerList()
  },
  created() {
    // this.getRoleList()
    this.getPowerList()
  },
  methods: {
    addRoles() {
      this.addRolesDialogVisible = true
    },
    getPowerList() {
      this.$axios.get('http://localhost:8081/roles/list').then(res => {
        if (res.data.code === 200) {
          this.roleList = res.data.data
          // 打开对话框后所有权限树
          this.rightsList = res.data.data[0].roles
        }
      })
    },
    // getRoleList() {
    //   this.$axios.get('http://localhost:8081/roles/findAll').then(res => {
    //     // TO_DO
    //     if (res.data.code === 200) {
    //       this.roleList = res.data.data
    //     }
    //   })
    // },
    // 展示分配权限的对话框
    showSetRightDialog(id) {
      this.rolesId = id
      this.defaultKeys = []
      this.getPowerTree(id)
      // 设置个延时函数，不然不能实时更新数据
      setTimeout(() => {
        this.setRightDialogVisible = true
        // 这是因为this.dialogVisible = true时并没有立即更新dom，而是等整个逻辑执行完后再一次新渲染，
        // 因此此时的弹框并未渲染，在dom树中是不存在的，
        // this.$refs.tree is undefined的所以setCheckedKeys肯定也是undefined。
        // 解决方法: this.$nextTick()，this.$nextTick()会在dom更新之后在执行回调：
        this.$nextTick(function() {
          this.$refs.treeRef.setCheckedKeys(this.defaultKeys)
        })
      }, 300)
    },
    // 得到用户对应勾选的权限树
    getPowerTree(rolesId) {
      this.$axios.get(`http://localhost:8081/roles/${rolesId}`).then(res => {
        if (res.data.code === 200) {
          if (res.data.data[0].powers !== null) {
            res.data.data[0].powers.forEach(item => {
              // 去重
              if (this.defaultKeys.indexOf(item.id) !== 0) {
                if (item.haveChildren) {
                  this.defaultKeys.push(item.id)
                }
              }
            })
          }
        }
      })
    },
    // 修改权限分配
    updateRightDialogVisible() {
      console.log(this.$refs.treeRef.getCheckedKeys())
      const keys = [
        // es6语法将数组展开
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 去掉就报NullPointerException
      const idStr = keys.join(',')
      const params = this.qs.stringify({
        ids: idStr
      })
      this.$axios
        .post(`http://localhost:8081/roles/updateTree/${this.rolesId}`, params)
        .then(res => {
          if (res.data.code === 200) {
            this.setRightDialogVisible = false
            this.$message.success('更新成功')
          }
        })
        .catch(err => {
          this.$message.error('更新失败' + err)
        })
    },
    handleNodeClick(data, node) {
      // this.$refs.treeRef.setCheckedKeys(this.defaultKeys)
      console.log(this.$refs.treeRef.getHalfCheckedKeys())
      console.log(node.key)
      console.log(this.defaultKeys)
    },
    // 分配权限对话框关闭前清空数组
    handleClose() {
      this.defaultKeys = []
    },
    expandChange(expandedRows) {
      var params = new URLSearchParams()
      params.append('id', expandedRows.id)
      this.$axios
        .put('http://localhost:8081/roles/expandTree', params)
        .then(res => {
          if (res.data.code === 200) {
          }
        })
    },
    // 添加角色
    addNewRoles() {
      var params = new URLSearchParams()
      params.append('roleName', this.addRolesRuleForm.roleName)
      params.append('roleDesc', this.addRolesRuleForm.roleDesc)
      console.log(this.addRolesRuleForm.roleDesc)
      this.$axios.post('http://localhost:8081/roles/add', params).then(res => {
        if (res.data.code === 200) {
          this.$message.success('添加成功')
          this.getPowerList()
          this.addRolesDialogVisible = false
        }
      })
    },
    // 添加角色对话框关闭
    addRolesCloseDialog() {
      this.$refs.addRolesRuleForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

// 让展开的标签居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
