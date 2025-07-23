### metaData: 
> 新增于Object3D的字段，存储模型变化前的相关信息

```json
{
  "material": "uuid | [uuid,uuid,uuid] | Material"
}
```

| 字段       | 说明                 |   |
|----------|--------------------|---|
| material | 模型原材质UUID / UUID数组 |   |

### ignore: 忽略
> 是否被忽略，仅用于显示（选中、场景树、打包等都会忽略）
> 含有ignore属性的对象与业务关联，不受scene管控,在场景清空/其他行为下与普通模型受操作方式不一样，勿随意使用
> 当前包含该属性的模型：grid

### traverseByCondition: Function
> 在对象以及后代中执行的回调函数,仅对满足条件的对象执行