import { z } from "zod/v4";

// ============================================================
// 示例 1: 基础字段 — 覆盖所有原始类型与包裹器
// 覆盖: string, nonempty, email(stringFormat), templateLiteral, number,
//       bigint, boolean, date, file, enum(select), literal(checkbox),
//       password/textarea(meta template), optional, nullable, nonOptional, default
// ============================================================
export const primitiveForm = z.object({
  name: z.string().nonempty("姓名不能为空").min(1, "至少1个字符").max(20, "最多20个字符")
    .meta({ label: "姓名", placeholder: "1-20个字符" }),
  email: z.email("邮箱格式不正确")
    .meta({ label: "邮箱", placeholder: "请输入邮箱" }),
  phone: z.templateLiteral([z.string().length(3), '-', z.string().length(4)])
    .meta({ label: "电话", placeholder: "xxx-xxxx" }),
  age: z.number().min(0, "年龄不能为负").max(150, "年龄不能超过150").default(20).optional()
    .meta({ label: "年龄", placeholder: "请输入年龄" }),
  score: z.number({ error: "评分为必填项" }).nonoptional("评分不能为空")
    .meta({ label: "评分", placeholder: "必填评分" }),
  bio: z.string().max(500, "简介最多500字").nullable()
    .meta({ label: "简介", placeholder: "可为空", template: 'textarea' }),
  password: z.string().nonempty("密码不能为空").min(8, "密码至少8位")
    .meta({ label: "密码", placeholder: "至少8位", template: 'password' }),
  birthday: z.date({ error: "请选择有效日期" })
    .meta({ label: "生日" }),
  balance: z.bigint({ error: "请输入有效的整数" })
    .meta({ label: "余额", placeholder: "请输入金额" }),
  avatar: z.file({ error: "请上传文件" })
    .meta({ label: "头像" }),
  active: z.boolean().default(false)
    .meta({ label: "启用" }),
  role: z.enum(["admin", "user", "guest"], { error: "请选择有效角色" })
    .meta({ label: "角色" }),
  agree: z.literal(true, { error: "必须同意条款" })
    .meta({ label: "同意条款", template: 'checkbox' }),
}).meta({ label: "基础字段" });

// ============================================================
// 示例 2: 容器类型 — 覆盖所有集合与嵌套结构
// 覆盖: array(scalar), array(object), array(array), tuple,
//       set, record(string,scalar), record(string,object), 嵌套 object
// ============================================================
export const collectionForm = z.object({
  tags: z.array(z.string().nonempty("标签不能为空").default('tag')).min(1, "至少添加1个标签").max(10, "最多10个标签")
    .meta({ label: "标签" }),
  items: z.array(z.object({
    name: z.string().nonempty("商品名称不能为空").meta({ label: "名称" }),
    qty: z.number().min(1, "数量至少为1").default(1).meta({ label: "数量" }),
  }).meta({ label: "商品" })).min(1, "至少添加1件商品")
    .meta({ label: "商品列表" }),
  matrix: z.number({ error: "请输入数字" }).array().array()
    .meta({ label: "矩阵" }),
  coords: z.tuple([
    z.number({ error: "经度必须为数字" }).meta({ label: "经度" }),
    z.number({ error: "纬度必须为数字" }).meta({ label: "纬度" }),
  ]).meta({ label: "坐标" }),
  uniqueIds: z.set(z.string().nonempty("ID不能为空"))
    .meta({ label: "唯一ID" }),
  headers: z.record(z.string(), z.string().nonempty("请求头值不能为空"))
    .meta({ label: "请求头" }),
  endpoints: z.record(z.string(), z.object({
    url: z.string().nonempty("URL不能为空").meta({ label: "URL" }),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE'], { error: "请选择有效方法" }).meta({ label: "方法" }),
  })).meta({ label: "接口配置" }),
}).meta({ label: "容器类型" });

// ============================================================
// 示例 3: 联合与组合 — 覆盖 union 相关类型
// 覆盖: discriminatedUnion, union(generic), intersection
// ============================================================
export const unionForm = z.object({
  payment: z.discriminatedUnion("method", [
    z.object({
      method: z.literal("card").meta({ label: "方式" }),
      cardNumber: z.string().nonempty("卡号不能为空").meta({ label: "卡号", placeholder: "16位数字" }),
    }).meta({ label: "银行卡" }),
    z.object({
      method: z.literal("alipay").meta({ label: "方式" }),
      account: z.string().nonempty("账号不能为空").meta({ label: "账号" }),
    }).meta({ label: "支付宝" }),
  ]).meta({ label: "支付方式" }),
  value: z.union([
    z.object({ kind: z.literal('text').meta({ label: "类型" }), content: z.string().nonempty("内容不能为空").meta({ label: "内容" }) }),
    z.object({ kind: z.literal('num').meta({ label: "类型" }), content: z.number({ error: "请输入数字" }).meta({ label: "内容" }) }),
  ]).meta({ label: "通用联合" }),
  combined: z.object({
    name: z.string().nonempty("名称不能为空").meta({ label: "名称" }),
  }).and(z.object({
    age: z.number({ error: "请输入有效年龄" }).meta({ label: "年龄" }),
  })).meta({ label: "交叉类型" }),
}).meta({ label: "联合与组合" });