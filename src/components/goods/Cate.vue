<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!--是否有效区域：等同于 slot="isOk" slot-scope="scope" -->
        <template v-slot:isOk="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen;"
            v-if="scope.row.catDeleted === 0"
          ></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:sort="scope">
          <el-tag size="mini" v-if="scope.row.catLevel === 0">一级</el-tag>
          <el-tag
            size="mini"
            v-else-if="scope.row.catLevel === 1"
            type="success"
            >二级</el-tag
          >
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:option="scope">
          <el-button
            type="primary"
            size="mini"
            @click="showEditDialog(scope.row)"
            ><i class="el-icon-edit">编辑</i></el-button
          >
          <el-button type="warning" size="mini"
            ><i class="el-icon-delete">删除</i></el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑操作对话框 -->
    <el-dialog
      title="编辑分类"
      @close="closeDialog"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="editRuleForm"
        status-icon
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="catName">
          <el-input
            v-model="editRuleForm.catName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="catDeleted">
          <el-input
            v-model="editRuleForm.catDeleted"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGoodCat">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="添加分类"
      @close="closeAddDialog"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <el-form
        :model="addRuleForm"
        status-icon
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="catName">
          <el-input v-model="addRuleForm.catName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="pid">
          <el-cascader
            v-model="selectedCatKeys"
            :options="cascaderList"
            :props="cateProps"
            clearable
            filterable
            ref="cascader"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoodCat">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var valiCateDeleted = (rule, value, cb) => {
      if (value === 0 || value === '1' || value === '0') {
        cb()
      }
      cb(new Error('0代表有效，1代表失效'))
    }
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pageNum: 1,
        pageSize: 5
      },
      // 商品分类的列表数据
      cateList: [
        {
          catName: '电视机',
          catDelete: false,
          children: [
            { catName: '看电视', children: [{ catName: '喜羊羊与灰太狼' }] }
          ]
        },
        {
          catName: '洗衣机',
          catDelete: true,
          children: [{ catName: '洗衣服' }]
        }
      ],
      // 总数居条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'catName'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'sort'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'option'
        }
      ],
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      editRuleForm: {
        catName: '',
        catDeleted: 0,
        id: 0
      },
      editRules: {
        catName: [{ required: true, message: '分类名称不能为空' }],
        catDeleted: [{ validator: valiCateDeleted, trigger: 'blur' }]
      },
      addRuleForm: {
        catName: ''
      },
      addRules: {
        catName: [{ required: true, message: '分类名称不能为空' }]
      },
      // 级联选择器的值列表
      cascaderList: [],
      // 级联选择器的配置
      cateProps: {
        label: 'catName',
        value: 'id',
        children: 'children',
        // 设置每一级都可以选中
        checkStrictly: true,
        // 设置悬浮展开
        expandTrigger: 'hover'
      },
      // 级联选择器双向绑定到数组中
      selectedCatKeys: [],
      // 添加分类的信息对象
      selectedCat: {
        // 被选中的几级分类:依旧number类型
        catPid: '',
        catLevel: '',
        catDeleted: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  mounted() {
    this.getCascaderList()
  },
  methods: {
    getCateList() {
      this.$axios
        .get('http://localhost:8081/goods', {
          params: {
            pageNum: this.queryInfo.pageNum,
            pageSize: this.queryInfo.pageSize,
            catLevel: 0
          }
        })
        .then(res => {
          if (res.data.code === 200) {
            this.cateList = res.data.data
            this.total = res.data.total
          }
        })
        .catch(err => {
          this.$message.error('查询失败:' + err)
        })
    },
    // 获取一级二级分类
    getCascaderList() {
      this.$axios
        .get('http://localhost:8081/goods/filterCat', {
          params: {
            catLevel: 0
          }
        })
        .then(res => {
          if (res.data.code === 200) {
            this.cascaderList = res.data.goods
          }
        })
        .catch(err => {
          this.$message.error('查询失败:' + err)
        })
    },
    handleSizeChange(newPageSize) {
      this.queryInfo.pageSize = newPageSize
      this.getCateList()
    },
    handleCurrentChange(newPageNum) {
      this.queryInfo.pageNum = newPageNum
      this.getCateList()
    },
    showEditDialog(goods) {
      this.editRuleForm.id = goods.id
      this.editRuleForm.catName = goods.catName
      this.editRuleForm.catDeleted = goods.catDeleted
      this.editDialogVisible = true
    },
    // 在对话框关闭的时候才重置表单，否则可能导致表单没加载进来，报错
    // 但是功能没影响
    closeDialog() {
      this.$refs.editFormRef.resetFields()
    },
    updateGoodCat() {
      this.$refs.editFormRef.validate(valid => {
        const params = this.qs.stringify({
          id: this.editRuleForm.id,
          catName: this.editRuleForm.catName,
          catDeleted: this.editRuleForm.catDeleted
        })
        this.$axios
          .put('http://localhost:8081/goods/update', params)
          .then(res => {
            if (res.data.code === 200) {
              this.getCateList()
              this.editDialogVisible = false
              this.$message.success('修改成功')
            }
          })
          .catch(err => {
            this.$message.error('修改失败:' + err)
          })
      })
    },
    // 展示添加分类的对话框
    showAddCatDialog() {
      this.addDialogVisible = true
    },
    // 级联选择器选中项变化会触发的函数
    handleChange() {
      if (this.selectedCatKeys.length === 1) {
        this.selectedCat.catPid = this.selectedCatKeys[0]
        this.selectedCat.catLevel = 1
      } else if (this.selectedCatKeys.length === 2) {
        this.selectedCat.catPid = this.selectedCatKeys[1]
        this.selectedCat.catLevel = 2
      }
      this.selectedCat.catDeleted = 0
    },
    // 提交添加的分类
    addGoodCat() {
      this.$refs.editFormRef.validate(valid => {
        const params = this.qs.stringify({
          catPid: this.selectedCat.catPid,
          catLevel: this.selectedCat.catLevel,
          catName: this.editRuleForm.catName,
          catDeleted: this.selectedCat.catDeleted
        })
        this.$axios
          .post('http://localhost:8081/goods/addCat', params)
          .then(res => {
            if (res.data.code === 200) {
              this.getCateList()
              this.addDialogVisible = false
              this.$message.success('添加成功')
            }
          })
          .catch(err => {
            this.$message.error('添加失败:' + err)
          })
      })
    },
    // 添加分类关闭时清空值
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
      // 很无奈：this.$refs.cascader.clearCheckedNodes is not a function"
      // 清空值
      this.$refs.cascader.inputValue = ''
      // 清空被选中的
      this.$refs.cascader.checkedValue = ''
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
