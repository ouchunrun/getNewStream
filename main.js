var connectButton = document.querySelector('button#connect');
var hangupButton = document.querySelector('button#hangup');
var cameraPrev = document.getElementById('cameraPrev')
var cameraPrevRes = document.getElementById('cameraPrevRes')
var mediaDevice = null

connectButton.disabled = true;
hangupButton.disabled = true;

function getConstraints(data) {
    var constraints = {}

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
            break
        case 'video':
            console.warn('get video stream')
            /***
             * 1、根据设备扫描结果获取最接近的分辨率
             * @type {null}
             */
            var matchResolution = null
            if(data.deviceId){
                // matchResolution 针对支持关键字的环境是一定支持的保存的分辨率，对于不支持的环境，不一定支持能取到保存的分辨率
                matchResolution = mediaDeviceInstance.getSuitableResolution({
                    frameRate: data.frameRate ? data.frameRate : 30,
                    width: data.width ? data.width : 640,
                    height: data.height ? data.height : 360,
                    deviceId: data.deviceId
                })
                constraints = {
                    audio: false,
                    video: {
                        deviceId: {
                            exact: data.deviceId
                        }
                    }
                }
            }else {
                constraints = {
                    audio: false,
                    video: true
                }
            }
            constraints.video.frameRate = { exact: matchResolution.frameRate ? matchResolution.frameRate : data.frameRate ? data.frameRate : 30 }
            constraints.video.aspectRatio =  matchResolution.width ? { exact: matchResolution.width / matchResolution.height } : {exact: data.width / data.height}
            constraints.video.width = { exact: matchResolution.width ? matchResolution.width : data.width ? data.width: 640 }
            constraints.video.height = { exact: matchResolution.height ? matchResolution.height : data.height ? data.height : 360 }
            break
        case 'screenShare':
            console.warn('get present stream')
            break;
        default:
            console.warn("data.streamType: ", data.streamType)
            break
    }
    return constraints
}

function getUserMediaRepeatedly(data){
    var videoTrack = localStream ? localStream.getVideoTracks()[0] : null
    var applyconstraints

    console.log("getUserMediaRepeatedly")
    switch (data.error.name) {
        case 'PermissionDeniedError':
        case 'NotAllowedError':
        case 'PermissionDismissedError':
        case 'NotFoundError':
        case 'InternalError':
            data.callback({error: data.error})
            break
        case 'OverconstrainedError':

            var requestedConstraints
            if(data.useKeyWordConstraints === 'exact'){
                console.log("use exact")
                requestedConstraints = {
                    frameRate: data.constraints.video.frameRate.exact,
                    width: data.constraints.video.width.exact,
                    height: data.constraints.video.height.exact,
                    // deviceId: data.constraints.video.deviceId.exact,
                    deviceId: window.useApplyConstraints === true ? null: data.constraints.video.deviceId.exact
                }

                if(data.constraints.video.height.exact === 720){
                    data.constraints.video.width.exact = 1280
                }else if(data.constraints.video.height.exact === 600){
                    data.constraints.video.width.exact = 800
                }else if(data.constraints.video.height.exact === 480){
                    data.constraints.video.width.exact = 640
                }
            }else if(data.useKeyWordConstraints === 'ideal'){
                console.log('use ideal')
                requestedConstraints = {
                    frameRate: data.constraints.video.frameRate.ideal,
                    width: data.constraints.video.width.ideal ,
                    height: data.constraints.video.height.ideal,
                    // deviceId: data.constraints.video.deviceId.ideal,
                    deviceId: window.useApplyConstraints === true ? null: data.constraints.video.deviceId.ideal
                }
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
            }else if(data.useKeyWordConstraints === 'notSupported'){
                requestedConstraints = {
                    frameRate:  data.constraints.video.frameRate,
                    deviceId:  data.constraints.video.deviceId,
                    width:  data.constraints.video.width,
                    height:  data.constraints.video.height
                }
            }

            if(window.useApplyConstraints === true){
                requestedConstraints.frameRate = 30
            }

            console.log("上一次取流失败的分辨率为 :", JSON.stringify(requestedConstraints, null, ' '))
            var deviceId = data.constraints.video.deviceId ? data.constraints.video.deviceId.exact ? data.constraints.video.deviceId.exact : data.constraints.video.deviceId.ideal ? data.constraints.video.deviceId.ideal : data.deviceId : data.deviceId
            console.log("deviceId: ", deviceId)

            // 获取当前使用的设备的能力
            var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
            var capability = []
            var cameras = mediaDevice.cameras
            if(cameras && cameras.length){
                for(var i = 0;i<cameras.length;i++){
                    if(cameras[i].deviceId === deviceId){
                        capability = cameras[i].capability
                    }
                }
            }
            if(!capability.length) {
                console.warn("使用快速扫描列表作为当前设备能力，一个个的扫描")
                capability = mediaDeviceInstance.getQuickScanList()
            }
            console.log("当前设备能力capability: ", capability)

            // 获取下一个新的分辨率
            var newconstraints
            for(var j = 0; j<capability.length; j++){
                // 获取下一个分辨率值
                if(capability[j].width === requestedConstraints.width && capability[j].height === requestedConstraints.height && capability[j].frameRate === requestedConstraints.frameRate){
                    newconstraints = capability[j+1]
                    break
                }
            }

            console.warn("match new Constraints: ", newconstraints)
            if(newconstraints){
                var constraintsToGum
                if(data.useKeyWordConstraints === 'exact'){
                    constraintsToGum = {
                        audio: false,
                        video: {
                            deviceId: { exact: requestedConstraints.deviceId },
                            frameRate: { exact: newconstraints.frameRate },
                            aspectRatio: { exact: newconstraints.width / newconstraints.height },
                            // width: { exact: newconstraints.width },
                            width: { exact: 1000 },   // 测试使用
                            height: { exact: newconstraints.height }
                        }
                    }
                }else if(data.useKeyWordConstraints === 'ideal'){
                    constraintsToGum = {
                        audio: false,
                        video: {
                            deviceId: {
                                ideal: deviceId
                            },
                            frameRate: {
                                ideal: newconstraints.frameRate,
                                max: newconstraints.frameRate
                            },
                            aspectRatio: {
                                ideal: newconstraints.width / newconstraints.height,
                                max: newconstraints.width / newconstraints.height,
                                exact: 1  // 为了测试添加
                            },
                            width: {
                                ideal: newconstraints.width,
                                max: newconstraints.width,
                                exact: 1000 ,   // 测试使用
                            },
                            height: {
                                ideal: newconstraints.height,
                                max: newconstraints.height
                            }
                        }
                    }
                }else if(data.useKeyWordConstraints === 'notSupported'){
                    constraintsToGum = {
                        audio: false,
                        video: {
                            deviceId: deviceId,
                            frameRate: newconstraints.frameRate,
                            aspectRatio: newconstraints.width / newconstraints.height,
                            width: newconstraints.width,
                            height: newconstraints.height
                        }
                    }
                }

                if(localStream && localStream.getVideoTracks().length && localStream.active === true) {
                    applyconstraints = constraintsToGum.video
                    delete applyconstraints.deviceId
                    applyconstraints.width.exact = 1280

                    if(videoTrack && videoTrack.applyConstraints){
                        console.warn("use applyConstraints", JSON.stringify(applyconstraints, null, ' '))
                        videoTrack.applyConstraints(applyconstraints).then(function () {
                            console.info('getStreamSuccess stream id :' + localStream.id)
                            data.callback({stream: localStream})
                        }).catch(function (error) {
                            console.error("getStreamFailed: ", error);
                            data.constraints = constraintsToGum
                            data.error = error
                            getUserMediaRepeatedly(data)
                        })
                    }
                }else {
                    console.warn(" getUserMedia constraintsToGum: ", JSON.stringify(constraintsToGum, null, ' '))
                    navigator.mediaDevices.getUserMedia(constraintsToGum).then(function (stream) {
                        console.info('getStreamSuccess stream id :' + stream.id)
                        data.callback({stream: stream})
                    }).catch(function (error) {
                        console.error("getStreamFailed: ", error);
                        data.constraints = constraintsToGum
                        data.error = error
                        getUserMediaRepeatedly(data)
                    })
                }

            }else {
                // 应该先获取第一个取流失败时候的分辨率，不能直接获取最大的分辨率，会超出限制
                if( data.useKeyWordConstraints === 'exact'){
                    console.warn("超出限制，exact已扫描完支持的分辨率的列表，现在使用ideal扫描")
                    data.useKeyWordConstraints = 'ideal'
                    console.warn("set useKeyWordConstraints to ideal")
                    data.constraints.video = {
                        frameRate: {
                            ideal: data.frameRate,
                            max: data.frameRate
                        },
                        aspectRatio: data.aspectRatio,
                        width: {
                            ideal: data.width,
                            max: data.width,
                            exact: 1000  // 为了测试添加
                        } ,
                        height: {
                            ideal: data.height,
                            max: data.height,
                            exact: 1000  // 为了测试添加
                        },
                        deviceId: {
                            ideal: data.deviceId
                        }
                    }
                }else if(data.useKeyWordConstraints === 'ideal'){
                    console.warn("超出限制，ideal 已扫描完支持的分辨率的列表，不使用关键字")
                    console.warn("set useKeyWordConstraints to null")
                    data.useKeyWordConstraints = 'notSupported'
                    data.constraints.video = {
                        frameRate: data.frameRate,
                        aspectRatio: data.width / data.height,
                        width: data.width,
                        height: data.height,
                        deviceId: data.deviceId
                    }
                }else {
                    console.warn("取流彻底失败，没有取到流")
                    data.callback({error: ''})
                    return
                }

                var constraints = data.constraints
                console.warn("getUserMedia constraints: ", JSON.stringify(data.constraints, null, ' '))


                console.warn("localStream: ", localStream)
                if(localStream && localStream.getVideoTracks().length && localStream.active === true) {
                    applyconstraints = constraints.video
                    delete applyconstraints.video.deviceId

                    if(videoTrack && videoTrack.applyConstraints){
                        console.warn("use applyConstraints", JSON.stringify(applyconstraints, null, ' '))
                        videoTrack.applyConstraints(applyconstraints).then(function (stream) {
                            console.info('getStreamSuccess stream id :' + stream.id)
                            data.callback({stream: stream})
                        }).catch(function (error) {
                            console.error("getStreamFailed: ", error);
                            data.constraints = constraintsToGum
                            data.error = error
                            getUserMediaRepeatedly(data)
                        })
                    }
                }else {
                    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                        console.info('getStreamSuccess stream id :' + stream.id)
                        data.callback({stream: stream})
                    }).catch(function (error) {
                        console.error("getStreamFailed: ", error);
                        data.constraints = constraints
                        data.error = error
                        getUserMediaRepeatedly(data)
                    })
                }

            }
            break
        default:
            break
    }

}

/***
 * 取流：包括 桌面共享present(window/screen/tab/all)、摄像头共享（audio/video）
 * FAQ： 如何区分预览取流和正常取流（不用区分，都是取流，预览是不存在服务器要求的分辨率的）
 * @param data
 * @returns {null}
 */
async function getMedia(data) {
    if (!data || !data.streamType) {
        console.error("Invalid argument");
        return null;
    }

    var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
    var isKeywordSupport = mediaDevice ? mediaDevice.isConstraintsKeywordSupport : null
    if(isKeywordSupport !== null){
        data.useKeyWordConstraints = 'exact'
    }
    // 获取分辨率
    // var constraints = getConstraints(data)
    var constraints = {}

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
            break
        case 'video':
            console.warn('get video stream')
            /***
             * 1、根据设备扫描结果获取最接近的分辨率
             * @type {null}
             */
            var matchResolution = null
            if(data.deviceId){
                // matchResolution 针对支持关键字的环境是一定支持的保存的分辨率，对于不支持的环境，不一定支持能取到保存的分辨率
                matchResolution = mediaDeviceInstance.getSuitableResolution({
                    frameRate: data.frameRate ? data.frameRate : 30,
                    width: data.width ? data.width : 640,
                    height: data.height ? data.height : 360,
                    deviceId: data.deviceId
                })
                constraints = {
                    audio: false,
                    video: {
                        deviceId: {
                            exact: data.deviceId
                        }
                    }
                }
            }else {
                constraints = {
                    audio: false,
                    video: true
                }
            }
            constraints.video.frameRate = { exact: matchResolution.frameRate ? matchResolution.frameRate : data.frameRate ? data.frameRate : 30 }
            constraints.video.aspectRatio =  matchResolution.width ? { exact: matchResolution.width / matchResolution.height } : {exact: data.width / data.height}
            constraints.video.width = { exact: matchResolution.width ? matchResolution.width : data.width ? data.width: 640 }
            constraints.video.height = { exact: matchResolution.height ? matchResolution.height : data.height ? data.height : 360 }
            break
        case 'screenShare':
            console.warn('get present stream')
            break;
        default:
            console.warn("data.streamType: ", data.streamType)
            break
    }
    console.info("根据设备扫描结果获取最接近的分辨率: \n" + JSON.stringify(constraints, null, '    ') );

    var getStreamSuccess = function (stream) {
        console.info('getStreamSuccess stream id :' + stream.id)
        data.callback({stream: stream})
    }

    var getStreamFailed = function (error) {
        console.error("getStreamFailed: ", error);
        constraints.video.height.exact = 720    // 测试添加，修改800设置
        data.constraints = constraints
        data.error = error
        getUserMediaRepeatedly(data)
        // data.callback({error: error})
    }

    if(data.streamType === 'audio'){
        navigator.mediaDevices.getUserMedia(constraints).then(getStreamSuccess).catch(getStreamFailed)
    }else if(data.streamType === 'video'){
        var videoTrack = null
        if(localStream && localStream.getVideoTracks().length /*&& localStream.active === true*/){
            localStream = await navigator.mediaDevices.getUserMedia({audio: false, video: {deviceId: data.deviceId}})
            videoTrack = localStream.getVideoTracks()[0]

            // 使用applyConstraints接口
            var applyconstraints = constraints.video
            delete applyconstraints.deviceId
            applyconstraints.frameRate.exact = 50

            if(videoTrack && videoTrack.applyConstraints){
                console.warn("use applyConstraints", JSON.stringify(applyconstraints, null, ' '))
                videoTrack.applyConstraints(applyconstraints).then(function () {
                    getStreamSuccess(localStream)
                }).catch(function (error) {
                    window.useApplyConstraints = true;
                    getStreamFailed(error)
                })
            }
        }else {
            console.warn("use getUserMedia")
            // constraints.video.height.exact = 800  // 测试添加
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                getStreamSuccess(stream)
            }).catch(function (error) {
                getStreamFailed(error)
            })
        }
    }
    else if(data.streamType === 'present'){

    }
}

async function selectDeviceAndGum(){
    var deviceId = getUsingDeviceId()
    console.warn("deviceId: ", deviceId)
    if(deviceId === ""){
        return
    }

    console.log("clear stream first")
    closeStream()

    var getStreamCallback = function (data) {
        if(data.stream){
            console.warn('get stream success');
            localStream = data.stream
            cameraPrev.srcObject = data.stream
            localVideo.srcObject = data.stream;
            connectButton.disabled = false;
        }else if(data.error){
            console.error('get stream failed: ', data.error)
        }else {
            console.warn(data)
        }
    }

    var data = JSON.parse(getUserMediaConstraintsDiv.value);
    data.deviceId = deviceId
    data.callback = getStreamCallback

    console.log("设置的分辨率:: \n" + JSON.stringify(data, null, '    ') );
    getMedia(data)
}
