<template>
  <div>
    <!-- 面包屑导肮 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效的模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序的模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作的模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- option为数据源 -->
          <el-cascader
            v-model="selectedValue"
            :options="parentCateList"
            :props="cascaderPorps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="提示" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="addCateRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList:[],
      queryInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      // 总数居条数
      total: 0,
      // 为表格指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前这一列定义为模板
          type: 'template',
          // 模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前这一列定义为模板
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前这一列定义为模板
          type: 'template',
          // 模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单对象
      addCateForm:{
        // 分类的父id
        cat_pid:0,
        // 分类名称
        cat_name:'',
        // 分类等级
        cat_level:0
      },
      // 添加分类表单验证规则
      addCateRules:{
        cat_name:[
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      // 父级分类列表
      parentCateList:[],
      // 级联选择器配置对象
      cascaderPorps:{
        checkStrictly: true,
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      // 选中的分类id数组
      selectedValue:[],
      // 控制编辑分类对话框
      editCateDialogVisible : false,
      // 获取分类信息
      editCateForm:{
        cat_id:0,
        cat_name : ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const {data:res} = await this.$http.get('categories', {params : this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 添加分类时获取父级分类列表
    async getParentCateList() {
      const {data:res} = await this.$http.get('categories', {params : {type:2}})
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      console.log(res)
      this.parentCateList = res.data
    },
    // 选择器发生变化时触发
    parentCateChange() {
      // 对分类进行判断
      if (this.selectedValue.length > 0) {
        this.addCateForm.cat_pid = this.selectedValue[this.selectedValue.length - 1]
        this.addCateForm.cat_level = this.selectedValue.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data:res} = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加分类对话框重置
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedValue = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 编辑分类对话框
    async showEditCateDialog(catId) {
      const {data:res} = await this.$http.get('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editCateForm.cat_id = res.data.cat_id
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    // 提交编辑
    editCate() {
      this.$refs.editCateFormRef.validate(async vaild => {
        if (!vaild) return
        const {data:res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {cat_name: this.editCateForm.cat_name})
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('修改分类名称成功')
        this.editCateForm.cat_id = 0
        this.editCateForm.cat_name = ''
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    async removeCate(catId) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const {data:res} = await this.$http.delete('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('删除分类成功')
      this.queryInfo.pagenum = 1
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
