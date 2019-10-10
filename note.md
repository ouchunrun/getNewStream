# 媒体设备管理

（保存整个扫描的分辨率文本）
- 分辨率比例
- 实际要求分辨率
- 实际得到的分辨率
- 帧率
- 使用设备名称判断设备是否变化，因为deviceId是每次都会改变的

扫描时不使用exact等关键字，根据取流后video的高度宽度判断是否成功

## FAQ

- 有些浏览器存在需要授权才能拿到设备名称的情况，
- mac pro 还是mac air 存在原本支持 640*480 但是之际 取到的还是640*360的情况

----

# 取流模块

## 类型

> 策略：取流使用exact取流，exact取分辨率支持列表都失败后使用ideal，ideal都失败后不使用关键字
> 关键点：当前分辨率、服务器要求的分辨率、实际取到的分辨率。实际取到的分辨率不超过服务器限制的话就可以


- audio
- video
- screenShare

### audio

```
 var constraints = {}
  if(options.deviceId){
     constraints = {
         audio: { deviceId: options.deviceId },
         video: false
     }
 }else {
    constraints = { audio: true, video: false }
 }
```


### video


### screenShare


## 接口

### getStreamConstraints  获取分辨率

#### 参数 data
```
data{
    streamType: 'video',   // 取流类型audio/ video/ screenShare
    frameRate: 30,  服务器要求的帧率
    aspectRatio: {    要求的分辨率
        min: 1.777,
        max: 1.778
    },
    width: 1280,   要求的分辨率宽度
    height: 720,   要求的分辨率高度
}

```


#### 返回值 constraints

- 返回处理好的constraints，根据服务器要求的分辨率和设备支持的能力获取最佳的分辨率。

- 这里要判断是否使用关键字限制


### getMedia 取流

#### 参数 data
```
data{
    streamType: 'video',   // 取流类型audio/ video/ screenShare
    frameRate: 30,  服务器要求的帧率
    aspectRatio: {    要求的分辨率
        min: 1.777,
        max: 1.778
    },
    width: 1280,   要求的分辨率宽度
    height: 720,   要求的分辨率高度
}

```


#### 返回值 无

- 成功后或失败后调用传入的回调函数