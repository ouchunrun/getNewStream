var connectButton = document.querySelector('button#connect');
var hangupButton = document.querySelector('button#hangup');
var cameraPrev = document.getElementById('cameraPrev')
var cameraPrevRes = document.getElementById('cameraPrevRes')
var mediaDevice = null

connectButton.disabled = true;
hangupButton.disabled = true

function getUserMediaRepeatedly(data){
    console.warn("getUserMediaRepeatedly" , data);
    /* 开始：这部分用来测试 */
    if(data.constraintsKeyWord === 'exact'){
        console.log("use exact")
        if(data.constraints.video.height.exact === 720){
            data.constraints.video.width.exact = 1280
        }else if(data.constraints.video.height.exact === 600){
            data.constraints.video.width.exact = 800
        }else if(data.constraints.video.height.exact === 480){
            data.constraints.video.width.exact = 640
        }
    }
    else if(data.constraintsKeyWord === 'ideal'){
        console.log('use ideal')
        if(data.constraints.video.height.ideal === 720){
            data.constraints.video.width.ideal = 1280
            data.constraints.video.width.max = 1280
        }else if(data.constraints.video.height.ideal === 600){
            data.constraints.video.width.ideal = 800
            data.constraints.video.width.max = 800
        }else if(data.constraints.video.height.ideal === 480){
            data.constraints.video.width.ideal = 640
            data.constraints.video.width.max = 640
        }
        delete data.constraints.video.width.exact
        delete data.constraints.video.height.exact
    }
    /* 结束：这部分用来测试 */
    console.log("上一次取流失败的分辨率为 :", JSON.stringify(data.constraints, null, ' '))
    var requestedConstraints = {
        frameRate: data.constraints.video.frameRate.exact ? data.constraints.video.frameRate.exact : data.constraints.video.frameRate.ideal ? data.constraints.video.frameRate.ideal: data.constraints.video.frameRate,
        width: data.constraints.video.width.exact ? data.constraints.video.width.exact : data.constraints.video.width.ideal ? data.constraints.video.width.ideal : data.constraints.video.width,
        height: data.constraints.video.height.exact ? data.constraints.video.height.exact : data.constraints.video.height.ideal ? data.constraints.video.height.ideal : data.constraints.video.height,
        deviceId: data.constraints.video.deviceId.exact ? data.constraints.video.deviceId.exact : data.constraints.video.deviceId.ideal ? data.constraints.video.deviceId.ideal : data.constraints.video.deviceId,
    }

    /** 获取下一个分辨率*/
    var deviceId = requestedConstraints.deviceId ? requestedConstraints.deviceId : data.deviceId
    var capability = getCapability(requestedConstraints.deviceId)
    var nextConstraints
    for(var j = 0; j<capability.length; j++){
        if(capability[j].width === requestedConstraints.width && capability[j].height === requestedConstraints.height && capability[j].frameRate === requestedConstraints.frameRate){
            // 这里获取当前列表的下一个分辨（按照扫描列表的要求）
            nextConstraints = capability[j+1]
            break
        }
    }

    console.warn("设备支持能力范围的下一个分辨率为: ", nextConstraints)
    let repeatGumData
    if(nextConstraints){
        repeatGumData = {
            constraintsKeyWord: data.constraintsKeyWord,
            streamType: data.streamType,
            deviceId: deviceId,
            aspectRatio: nextConstraints.aspectRatio,
            frameRate: nextConstraints.frameRate,
            width: nextConstraints.width,
            height: nextConstraints.height,

        }
    }else {
        // 应该先获取第一个取流失败时候的分辨率，不能直接获取最大的分辨率，会超出限制
        if( data.constraintsKeyWord === 'exact'){
            console.warn("超出限制，exact已扫描完支持的分辨率的列表，现在使用ideal扫描")
            data.constraintsKeyWord = 'ideal'
            console.warn("set constraintsKeyWord to ideal")
        }else if(data.constraintsKeyWord === 'ideal'){
            console.warn("超出限制，ideal 已扫描完支持的分辨率的列表，不使用关键字")
            console.warn("set constraintsKeyWord to null")
            data.constraintsKeyWord = 'notSupported'
        }else {
            console.warn("取流彻底失败，没有取到流")
            data.callback({error: ''})
            return
        }

        repeatGumData = {
            constraintsKeyWord: data.constraintsKeyWord,
            streamType: data.streamType,
            deviceId: deviceId,
            aspectRatio: data.aspectRatio,
            frameRate: data.frameRate,
            width: data.width,
            height: data.height,

        }
    }

    let constraintsToGum = getConstraints(repeatGumData)
    gumApi({
        mediaConstraints: constraintsToGum,
        streamType: data.streamType,
        callback: data.callback
    })
}

/***
 * 取流：包括 桌面共享present(window/screen/tab/all)、摄像头共享（audio/video）
 * FAQ： 如何区分预览取流和正常取流（不用区分，都是取流，预览是不存在服务器要求的分辨率的）
 * 参数说明：
 * streamType
 * frameRate
 * aspectRatio
 * width
 * height
 *
 */
async function selectDeviceAndGum(){
    var deviceId = getUsingDeviceId()
    console.warn("deviceId: ", deviceId)
    if(deviceId === ""){
        console.warn("请选择有效设备")
        return
    }
    console.log("clear stream first")
    closeStream()

    var gumCallback = function (message) {
        if(message.stream){
            console.warn('get stream success');
            localStream = message.stream
            cameraPrev.srcObject = message.stream
            localVideo.srcObject = message.stream;
            connectButton.disabled = false;
        }else if(message.error){
            console.error("getStreamFailed: ", message.error);
            data.constraints = constraints
            data.error = message.error
            // getUserMediaRepeatedly(data)
        }else {
            console.warn(message)
        }
    }

    var data = JSON.parse(getUserMediaConstraintsDiv.value);
    var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
    var isKeywordSupport = mediaDevice ? mediaDevice.isConstraintsKeywordSupport : null
    if(isKeywordSupport !== null){
        data.constraintsKeyWord = 'exact'
    }
    data.deviceId = deviceId
    data.callback = gumCallback
    console.log("设置的分辨率:: \n" + JSON.stringify(data, null, '    ') );

    if (!data || !data.streamType) {
        console.error("Invalid argument");
        return null;
    }

    // 获取分辨率
    var constraints = getConstraints(data)
    constraints.video.width.exact = 1000
    console.info("根据设备扫描结果获取最接近的分辨率: \n" + JSON.stringify(constraints, null, '    ') );

    var newData  = {
        streamType: data.streamType,
        mediaConstraints: constraints,
        constraintsKeyWord: data.constraintsKeyWord,
        callback: gumCallback
    }
    await gumApi(newData)
}
