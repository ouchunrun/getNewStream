/***
 * 获取当前使用的设备的能力
 * @returns {Array}
 */
function getCapability(deviceId) {
    let mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
    let capability = []
    let cameras = mediaDevice.cameras
    if(cameras && cameras.length){
        for(let i = 0;i<cameras.length;i++){
            if(cameras[i].deviceId === deviceId){
                capability = cameras[i].capability
            }
        }
    }

    if(!capability.length) {
        capability = mediaDeviceInstance.getQuickScanList()
    }
    console.log("capability: ", capability)

    return capability
}


function getNewStream(data) {
    console.warn("getNewStream data: ", JSON.stringify(data, null, '  '))
    let constraints = getVideoConstraints({
        streamType: data.streamType,
        constraintsKeyWord: data.constraintsKeyWord,
        deviceId: data.constraints.deviceId,
        frameRate: data.constraints.frameRate,
        height: data.constraints.height,
        width: data.constraints.width
    })

    /* 取流失败测试 */
    let test = constraints.video.frameRate.exact
    constraints.video.frameRate.exact = 50
    console.warn("设置getUserMedia width exact 1000")
    /* 结束 */

    console.warn("getNewStream constraints: ",  JSON.stringify(constraints, null))
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.warn("get stream success")
        data.callback({stream: stream})
    }).catch(function (error) {
        console.warn("get stream failed: " + error.name)
        constraints.video.frameRate.exact = test
        data.settings = constraints
        gumRepeatedly(data)
    })
}

function gumRepeatedly(data) {
    console.warn("gumRepeatedly: last constraints:", data)
    let lastSettings = data.settings
    let settings = {
        frameRate: lastSettings.video.frameRate.exact ? lastSettings.video.frameRate.exact : lastSettings.video.frameRate.ideal ? lastSettings.video.frameRate.ideal: lastSettings.video.frameRate,
        width: lastSettings.video.width.exact ? lastSettings.video.width.exact : lastSettings.video.width.ideal ? lastSettings.video.width.ideal : lastSettings.video.width,
        height: lastSettings.video.height.exact ? lastSettings.video.height.exact : lastSettings.video.height.ideal ? lastSettings.video.height.ideal : lastSettings.video.height,
        deviceId: lastSettings.video.deviceId.exact ? lastSettings.video.deviceId.exact : lastSettings.video.deviceId.ideal ? lastSettings.video.deviceId.ideal : lastSettings.video.deviceId,
    }

    /** 获取下一个分辨率*/
    let deviceId = settings.deviceId ? settings.deviceId : data.deviceId
    let capability = getCapability(deviceId)
    let nextConstraints
    for(let j = 0; j<capability.length; j++){
        if(capability[j].width === settings.width && capability[j].height === settings.height && capability[j].frameRate === settings.frameRate){
            nextConstraints = capability[j+1]
            break
        }
    }

    console.warn("nextConstraints: ", nextConstraints)
    if(!nextConstraints){
        console.warn("换限制取流")
        if( data.constraintsKeyWord === 'exact'){
            console.warn("exact已扫描完成，使用 ideal")
            data.constraintsKeyWord = 'ideal'
        }else if(data.constraintsKeyWord === 'ideal'){
            console.warn("ideal 已扫描完成，不使用关键字")
            data.constraintsKeyWord = ''
        }else {
            console.warn("取流彻底失败，没有取到流")
            data.callback({error: ''})
            return
        }
    }
    let repeatGumData = {
        constraintsKeyWord: data.constraintsKeyWord,
        streamType: data.streamType,
        deviceId: settings.deviceId ? settings.deviceId : data.deviceId,
        frameRate: nextConstraints ? nextConstraints.frameRate ? nextConstraints.frameRate : data.constraints.frameRate: data.constraints.frameRate,
        width: nextConstraints ? nextConstraints.width ? nextConstraints.width : data.constraints.width: data.constraints.width,
        height: nextConstraints ? nextConstraints.height ? nextConstraints.height : data.constraints.height: data.constraints.height,
    }

    let constraints = getVideoConstraints(repeatGumData)

    /* 取流失败测试 */
    let test
    if(constraints.video.height.exact){
        test = constraints.video.frameRate.exact
    }else if(constraints.video.height.ideal){
        test = constraints.video.frameRate.ideal
    }else {
        test =  constraints.video.frameRate
    }
    constraints.video.frameRate.exact = 50
    console.warn("设置getUserMedia width exact 1000")
    /* 结束 */

    console.info("gumRepeatedly constraints: ", JSON.stringify(constraints, null, '    '))
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.warn("取流成功")
        data.callback({stream: stream})
    }).catch(function (error) {
        console.warn("gumRepeatedly 取流失败============================================================s=", error.name)

        /* 测试 */
        console.warn("frameRate test: ", test)
        delete constraints.video.frameRate.exact
        if(constraints.video.height.exact){
            constraints.video.frameRate.exact = test
        }else if(constraints.video.height.ideal){
            constraints.video.frameRate.ideal = test
        }else {
            constraints.video.frameRate = test
        }
        /* 测试 */
        data.settings = constraints
        gumRepeatedly(data)
    })
}

/***
 * @param data 需要得参数
 constraintsKeyWord: "exact"
 deviceId: "8cd24e4d2ff8de04d9170e94899fdb24a10ac7c9d09cb90bbe796e754f768d03"
 frameRate: 15
 height: 720
 streamType: "video"
 width: 1280
 * @returns {{audio: boolean, video: {frameRate: {exact: number}, width: {exact: number}, aspectRatio: {exact: number}, height: {exact: number}}}}
 */
function getVideoConstraints(data) {
    let acquiredRes = {}
    let deviceId = data.deviceId
    console.log("deviceId: ", deviceId)
    if(deviceId){
        acquiredRes = mediaDeviceInstance.getSuitableResolution({
            frameRate: data.frameRate ? data.frameRate : 30,
            width: data.width ? data.width : 640,
            height: data.height ? data.height : 360,
            deviceId: data.deviceId
        })
        console.log("match constraints: ", acquiredRes)
    }

    let constraints = {
        audio: false,
        video: {
            frameRate :{
                exact: acquiredRes.frameRate ? acquiredRes.frameRate : data.frameRate ? data.frameRate : 30
            },
            aspectRatio: {
                exact: acquiredRes.width ? (acquiredRes.width / acquiredRes.height) : (data.width / data.height)
            },
            width: {
                exact: acquiredRes.width ? acquiredRes.width : data.width ? data.width: 640
            },
            height: {
                exact: acquiredRes.height ? acquiredRes.height : data.height ? data.height : 360
            }
        }
    }

    if(deviceId){
        constraints.video.deviceId = {
            exact : deviceId
        }
    }

    console.log("data.constraintsKeyWord: ", data.constraintsKeyWord)
    if(!data.constraintsKeyWord){
        console.warn("Do not use keyWord limit")
        constraints.video.frameRate = constraints.video.frameRate.exact
        constraints.video.aspectRatio = constraints.video.aspectRatio.exact
        constraints.video.width = constraints.video.width.exact
        constraints.video.height = constraints.video.height.exact
        if(constraints.video.deviceId.exact || constraints.video.deviceId.ideal){
            constraints.video.deviceId = constraints.video.deviceId.exact ? constraints.video.deviceId.exact : constraints.video.deviceId.ideal
        }
    }else if(data.constraintsKeyWord === 'ideal'){
        console.warn("Use ideal limit")
        constraints.video.frameRate.ideal = constraints.video.frameRate.exact
        constraints.video.aspectRatio.ideal = constraints.video.aspectRatio.exact
        constraints.video.width.ideal = constraints.video.width.exact
        constraints.video.height.ideal = constraints.video.height.exact
        // 使用max限制来避免超出要求的能力
        constraints.video.frameRate.max = constraints.video.frameRate.exact
        constraints.video.aspectRatio.max = constraints.video.aspectRatio.exact
        constraints.video.width.max = constraints.video.width.exact
        constraints.video.height.max = constraints.video.height.exact
        if(constraints.video.deviceId.exact){
            constraints.video.deviceId.ideal = constraints.video.deviceId.exact
        }
        // 删除exact属性
        delete constraints.video.frameRate.exact
        delete constraints.video.aspectRatio.exact
        delete constraints.video.width.exact
        delete constraints.video.height.exact
        delete constraints.video.deviceId.exact
    }else if(data.constraintsKeyWord === 'exact'){
        console.warn("Use exact limit")
    }

    console.warn("get new Video Constraints: ", JSON.stringify(constraints, null, '   '))
    return constraints
}