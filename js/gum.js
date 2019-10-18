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

/***
 * 获取分辨率
     callback: ƒ (message)
     constraintsKeyWord: "exact"
     streamType: "video"
     deviceId: "5e3722883e2e9337040a4f1ababf85a5bd2f6a36afc815fd391424ac05a84ab0"
     aspectRatio: { min: 1.777, max: 1.778 }
     frameRate: 30
     height: 720
     width: 1280
 */
function getConstraints(data) {
    let constraints = {}
    let deviceInfo =  JSON.parse(localStorage.getItem('mediaDevice'))
    console.warn("data: ", data)

    switch (data.streamType) {
        case 'audio':
            console.warn('get audio stream')
            if(data.deviceId){
                constraints = {
                    audio: { deviceId: data.deviceId },
                    video: false
                }
            }else {
                constraints = { audio: true, video: false }
            }
            break;
        case 'video':
            var acquiredRes = {}
            if(data.deviceId){
                acquiredRes = mediaDeviceInstance.getSuitableResolution({
                    frameRate: data.frameRate ? data.frameRate : 30,
                    width: data.width ? data.width : 640,
                    height: data.height ? data.height : 360,
                    deviceId: data.deviceId
                })
            }

            constraints = {
                audio: false,
                video: {
                    frameRate :{
                        exact: acquiredRes.frameRate ? acquiredRes.frameRate : data.frameRate ? data.frameRate : 30
                    },
                    aspectRatio: {
                        exact: acquiredRes.width ? (acquiredRes.width / acquiredRes.height) : data.width / data.height
                    },
                    width: {
                        exact: acquiredRes.width ? acquiredRes.width : data.width ? data.width: 640
                    },
                    height: {
                        exact: acquiredRes.height ? acquiredRes.height : data.height ? data.height : 360
                    }
                }
            }

            if(data.deviceId){
                constraints.video.deviceId = {
                    exact: data.deviceId
                }
            }

            if(!data.constraintsKeyWord){
                console.warn("use exact")
                constraints.video.frameRate = constraints.video.frameRate.exact
                constraints.video.aspectRatio = constraints.video.aspectRatio.exact
                constraints.video.width = constraints.video.width.exact
                constraints.video.height = constraints.video.height.exact
                if(constraints.video.deviceId.exact){
                    constraints.video.deviceId = constraints.video.deviceId.exact
                }
            }else if(data.constraintsKeyWord === 'ideal'){
                console.warn("use ideal")
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
            }
            break;
        case 'screenShare':
            console.warn('get present stream')
            break
        default:
            console.warn("type mis match: ", data.streamType)
            break
    }

    return constraints
}

/***
 * callback: ƒ (message)
   mediaConstraints: {audio: false, video: {…}}
   streamType: "video"
   constraintsKeyWord
 * @param data
 * @returns {Promise<void>}
 */
async function gumApi(data) {
    console.warn("gumApi data: ",  data)
    let constraints = data.mediaConstraints
    let stream

    try {
        if(data.streamType === 'audio'){
            stream = await navigator.mediaDevices.getUserMedia(constraints)
        }else if(data.streamType === 'video'){
            let videoTrack = null
            if(localStream && localStream.getVideoTracks().length && localStream.active === true){
                videoTrack = localStream.getVideoTracks()[0]
                var constraintsOfApply = constraints.video
                if(videoTrack && videoTrack.applyConstraints){
                    constraintsOfApply.width.exact = 1000
                    console.warn("设置 applyConstraints width exact 1000")
                    console.warn("use applyConstraints", JSON.stringify(constraintsOfApply, null, ' '))
                    await videoTrack.applyConstraints(constraintsOfApply)
                    stream = localStream
                }
            }else {
                console.warn("getUserMedia")
                constraints.video.width.exact = 1000
                console.warn("设置getUserMedia width exact 1000")
                stream = await navigator.mediaDevices.getUserMedia(constraints)
            }
        }else if(data.streamType === 'present'){

        }

        data.callback({stream: stream, constraints: constraints})
    }catch (error) {
        console.error(error)
        // data.callback({error: error})

        data.constraints = constraints
        data.error = error
        getUserMediaRepeatedly(data)
    }
}