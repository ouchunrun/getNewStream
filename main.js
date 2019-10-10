var connectButton = document.querySelector('button#connect');
var hangupButton = document.querySelector('button#hangup');
var cameraPrev = document.getElementById('cameraPrev')
var cameraPrevRes = document.getElementById('cameraPrevRes')
var mediaDevice = null

connectButton.disabled = true;
hangupButton.disabled = true;

function getStreamConstraints(data) {
    console.warn("'getStreamConstraints: \n" + JSON.stringify(data, null, '    ') );

    var constraints = {}
    if (data.streamType === 'audio'){
        console.warn('get audio stream')
        if(data.deviceId){
            constraints = {
                audio: { deviceId: data.deviceId },
                video: false
            }
        }else {
            constraints = { audio: true, video: false }
        }
    }

    if(data.streamType === 'video'){
        console.warn('get video stream')
        // 传入服务区要求的分辨率
        // 根据设备扫描结果获取最接近的分辨率
        // 取流
        constraints = {
            audio: false,
            video: true
        }

        var matchResolution = null
        if(data.deviceId){
            // matchResolution 针对支持关键字的环境是一定支持的，对于不支持的环境，不一定支持
            matchResolution = mediaDevice.getSuitableResolution({
                frameRate: data.frameRate ? data.frameRate : 30,
                width: data.width ? data.width : 640,
                height: data.height ? data.height : 360,
                deviceId: data.deviceId
            })

            constraints.video.deviceId = data.deviceId
        }
        console.warn(matchResolution)

        if(matchResolution){
            constraints.video.frameRate = {
                ideal : matchResolution.frameRate ? matchResolution.frameRate : 15,
                max :  matchResolution.frameRate ? matchResolution.frameRate : 30
            }

            constraints.video.aspectRatio.min = data.aspectRatio ? data.aspectRatio.min ? data.aspectRatio.min : 1.777 : 1.777
            constraints.video.aspectRatio.max = data.aspectRatio ? data.aspectRatio.max ? data.aspectRatio.max : 1.778 : 1.778

            constraints.video.width.ideal = matchResolution.width ? matchResolution.width : 640
            constraints.video.width.max =  matchResolution.width ? matchResolution.width : 640

            constraints.video.height.ideal = matchResolution.height ? matchResolution.height : 360
            constraints.video.height.max =  matchResolution.height ? matchResolution.height : 360
        }else {
            if(data.frameRate){
                constraints.video.frameRate.ideal = data.frameRate
                constraints.video.frameRate.max = data.frameRate
            }
            if(data.aspectRatio){
                constraints.video.aspectRatio.min = data.aspectRatio.min
                constraints.video.aspectRatio.max = data.aspectRatio.max
            }
            if(data.width){
                constraints.video.width.ideal = data.width
                constraints.video.width.max = data.width
            }
            if(data.height){
                constraints.video.height.ideal = data.height
                constraints.video.height.max = data.height
            }
        }
    }

    if(data.streamType === 'screenShare'){
        console.warn('get present stream')
    }

    return constraints
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

    var getStreamSuccess = function (stream) {
        console.info('getStreamSuccess stream id :' + stream.id)
        data.callback({stream: stream})
    }

    var getStreamFailed = function (error) {
        console.error("getStreamFailed: " + error.name );
        data.callback({error: error})
    }

    var constraints = getStreamConstraints(data)
    if(data.streamType === 'audio' || data.streamType === 'video'){
        console.warn("'get getMedia stream constraints: \n" + JSON.stringify(constraints, null, '    ') );
        navigator.mediaDevices.getUserMedia(constraints).then(getStreamSuccess).catch(getStreamFailed)
    }else if(data.streamType === 'present'){

    }
}

async function selectDeviceAndGum(){
    var deviceId = getUsingDeviceId()
    if(deviceId === ""){
        return
    }
    // clear stream first
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
    data.useExactConstraints = await isConstraintsKeywordSupport()
    data.callback = getStreamCallback

    console.log("data: \n" + JSON.stringify(data, null, '    ') );
    getMedia(data)
}

/***
 * 判断取流是否支持关键字：min/max/exact/ideal
 * 常见：测试一体机不支持关键字
 * @returns {Promise<boolean>}
 */
async function isConstraintsKeywordSupport(){
    var result = true

    try {
        var constraints = {
            audio: false,
            video: {
                width: { ideal: 640, },
                height: { ideal: 360, }
            }
        }
        await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            log.info('ideal support')
            result = true
            closeStream(stream)
        }).catch(function () {
            log.info('ideal is not support')
            result = false
        })
    }catch (error) {
        result = false
    }

    console.warn('is constraints Keyword support: ', result)
    return result
}

function getUsingDeviceId () {
    var selectedIndex = document.getElementById('videoList').options.selectedIndex
    var selectedOption = document.getElementById('videoList').options[selectedIndex]
    return selectedOption.value
}

function closeStream() {
    // clear first
    var stream = cameraPrev.srcObject
    if (stream){
        try {
            stream.oninactive = null;
            var tracks = stream.getTracks();
            for (var track in tracks) {
                tracks[track].onended = null;
                log.info("close stream");
                tracks[track].stop();
            }
        }
        catch (error) {
            log.info('closeStream: Failed to close stream');
            log.error(error);
        }
        stream = null;
        cameraPrev.srcObject = null
    }

    if (localStream) {
        localStream.getTracks().forEach(function(track) {
            track.stop();
        });
        var videoTracks = localStream.getVideoTracks();
        for (var i = 0; i !== videoTracks.length; ++i) {
            videoTracks[i].stop();
        }
    }
}

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        mediaDevice = new MediaDevice()
        var videoInputList = []
        videoInputList.push('<option class="cameraOption" value="">' + "请选择" + '</option>')
        mediaDevice.enumDevices(deviceInfo => {
            console.log('enumDevices' + JSON.stringify(deviceInfo.cameras))
            if (deviceInfo.cameras) {
                for (var j = 0; j < deviceInfo.cameras.length; j++) {
                    if (!deviceInfo.cameras[j].label) {
                        deviceInfo.cameras[j].label = 'camera' + j
                    }
                    videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[j].deviceId + '">' + deviceInfo.cameras[j].label + '</option>')
                    console.log('camera: ' + deviceInfo.cameras[j].label)
                }
            }
            videoInputList.push('<option class="cameraOption" value="presentShare">' + "presentShare" + '</option>')
            document.getElementById('videoList').innerHTML = videoInputList.join('')

            mediaDevice.checkAvailableDev()
            setTimeout(function () {
                mediaDevice.setDeviceCapability()
            }, 1000)
        }, function (error) {
            console.error('enum device error: ' + error)
        })
    }
}