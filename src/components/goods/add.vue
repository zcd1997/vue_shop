<template>
  <div>
    <!-- 面包屑导肮 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="tabActiveIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addGoodForm"
        :rules="addGoodRules"
        ref="addGoodFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="tabActiveIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in this.manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in this.onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传的地址 -->
            <el-upload
              :action="uploadurl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑 -->
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewpath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 深拷贝
import _ from 'lodash'

export default {
  data() {
    return {
      tabActiveIndex:'0',
      // 添加商品的数据对象
      addGoodForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        goods_cat:[],
        pics:[],
        goods_introduce:'',
        attrs:[]
      },
      addGoodRules:{
        goods_name:[
          {required: true, message: '请输入商品名称', trigger: 'blur'}
        ],
        goods_price:[
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goods_weight:[
          {required: true, message: '请输入商品重量', trigger: 'blur'}
        ],
        goods_number:[
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ],
        goods_cat:[
          {required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      // 商品分类列表
      catelist:[],
      cateProps:{
        expandTrigger: 'hover',
        label:'cat_name',
        value:'cat_id',
        children:'children'
      },
      // 动态参数列表数据
      manyTableData:[],
      // 静态参数列表数据
      onlyTableData:[],
      // 上传图片的地址
      uploadurl:'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的请求头
      headerObj:{
        Authorization : window.sessionStorage.getItem('token')
      },
      previewpath:'',
      previewDialogVisible:false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const {data:res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catelist = res.data
    },
    // 级联选择器变化时触发
    handleChange() {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
      }
    },
    // 离开当前tab
    beforeTabLeave(activeName, oldActiveName) {
      // 我觉得还可以直接验证表单
      // await this.$refs.addGoodFormRef.validate()
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类信息')
        return false
      }
    },
    // tab切换
    async tabClick() {
      // 访问动态参数tab
      if (this.tabActiveIndex === '1') {
        const { data: res} = await this.$http.get(`categories/${this.catId}/attributes`, {params:{sel:'many'}})
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? '' : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.tabActiveIndex === '2') {
      // 访问静态参数tab
        const { data: res} = await this.$http.get(`categories/${this.catId}/attributes`, {params:{sel:'only'}})
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewpath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片删除
    handleRemove(file) {
      const filepath = file.response.data.tmp_path
      const index = this.addGoodForm.pics.findIndex(i =>
        i.pic === filepath
      )
      this.addGoodForm.pics.splice(index, 1)
    },
    // 图片上传成功回调
    handleSuccess(response) {
      const picInfo = {pic : response.data.tmp_path}
      this.addGoodForm.pics.push(picInfo)
    },
    // 添加商品提交
    async addGood() {
      this.$refs.addGoodFormRef.validate(vaild => {
        if (!vaild) {
          return this.$message.error('请填写必要的表单项')
        }
      })
      const form = _.cloneDeep(this.addGoodForm)
      form.goods_cat = form.goods_cat.join(',')
      // 处理动态参数
      this.manyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(',')
        }
        this.addGoodForm.attrs.push(newInfo)
      })
      // 处理静态属性
      this.onlyTableData.forEach(item => {
        const newInfo = {
          attr_id:item.attr_id,
          attr_value: item.attr_vals
        }
        this.addGoodForm.attrs.push(newInfo)
      })
      form.attrs = this.addGoodForm.attrs
      console.log(form)
      const {data:res} = await this.$http.post('goods', form)
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      console.log(res)
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    }
  },
  computed:{
    catId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.addBtn{
  margin-top: 15px;
}
</style>
