## 说明

关于流的操作，三个要点：

- 取流（getUserMedia）
- 限制分辨率（getUserMedia 获取新的流 或 applyConstraints改变流的分辨率）
- 加流（addStream 或 replaceTrack）

FAQ:

1、constraints 常用列表

2、如何进行 constraints min/max/ideal 参数支持测试？

3、取流失败后 constraints 如何设置？
    - 根据设备能力，在不超过服务器能力的情况下获取设备支持的最合适的分辨率


## 一、限制分辨率
1、MediaStreamTrack.applyConstraints() 接口使用条件

- 浏览器支持applyConstraints接口
- stream && stream.active == true

FAQ:

1、怎么确定 applyConstraints 生效？？因为存在applyConstraints成功但是实际并没有生效的场景
   
- videoTrack.getConstraints() 设置的分辨率
- videoTrack.getSettings() 当前流示例的分辨率、帧率【低版本不支持这个接口】

## 二、取流

1、预览 constraints  360*640
```
var constraint = {
    audio: false,
    video{
        frameRate: 30,
        aspectRatio: { min: 1.777, max: 1.778 },
        width: 360,
        height: 640
    }
}
```

预览取流不适用min/max/ideal/exact等参数所以不存在取流失败的情况
预览的必要性在于，避免开摄像头后在不知情的情况下出现尴尬的画面！


2、getUserMedia取流 constraints：根据服务器要求的分辨率取流

3、navigator.mediaDevices.getUserMedia  Promises方法

- 屏幕共享和摄像头共享设计为一个接口：getMedia()
- 服务器要求的分辨率及分辨率比例限制等，都可以通过传参设置，以及deviceId等