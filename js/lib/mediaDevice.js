/**
 * AMD, CommonJS, Global compatible Script Wrapper
 * https://github.com/umdjs/umd
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
        /* istanbul ignore next */
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.MediaDevice = factory();
    }
}(this, function () {


    function MediaDevice () {
        this.deviceCheckTimer = null
    }

    /***
     * 获取分辨率扫描列表
     */
    MediaDevice.prototype.getQuickScanList = function(){
        return [
            // {
            //     "label": "4K(UHD)",
            //     "width": 3840,
            //     "height": 2160,
            //     "ratio": "16:9",
            //     "frameRate": 30
            // },
            {
                "label": "4K(UHD)",
                "width": 3840,
                "height": 2160,
                "ratio": "16:9",
                "frameRate": 15
            },
            {
                "label": "1080p(FHD)",
                "width": 1920,
                "height": 1080,
                "ratio": "16:9",
                "frameRate": 30
            },
            // {
            //     "label": "1080p(FHD)",
            //     "width": 1920,
            //     "height": 1080,
            //     "ratio": "16:9",
            //     "frameRate": 15
            // },
            // {
            //     "label": "UXGA",
            //     "width": 1600,
            //     "height": 1200,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "UXGA",
            //     "width": 1600,
            //     "height": 1200,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            {
                "label": "720p(HD)",
                "width": 1280,
                "height": 720,
                "ratio": "16:9",
                "frameRate": 30
            },
            // {
            //     "label": "720p(HD)",
            //     "width": 1280,
            //     "height": 720,
            //     "ratio": "16:9",
            //     "frameRate": 15
            // },
            // {
            //     "label": "SVGA",
            //     "width": 800,
            //     "height": 600,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "SVGA",
            //     "width": 800,
            //     "height": 600,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            // {
            //     "label": "VGA",
            //     "width": 640,
            //     "height": 480,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "VGA",
            //     "width": 640,
            //     "height": 480,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            // {
            //     "label": "360p(nHD)",
            //     "width": 640,
            //     "height": 360,
            //     "ratio": "16:9",
            //     "frameRate": 30
            // },
            // {
            //     "label": "360p(nHD)",
            //     "width": 640,
            //     "height": 360,
            //     "ratio": "16:9",
            //     "frameRate": 15
            // },
            // {
            //     "label": "CIF",
            //     "width": 352,
            //     "height": 288,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "CIF",
            //     "width": 352,
            //     "height": 288,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            // {
            //     "label": "QVGA",
            //     "width": 320,
            //     "height": 240,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "QVGA",
            //     "width": 320,
            //     "height": 240,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            // {
            //     "label": "180p?",
            //     "width": 320,
            //     "height": 180,
            //     "ratio": "16:9",
            //     "frameRate": 30
            // },
            // {
            //     "label": "180p?",
            //     "width": 320,
            //     "height": 180,
            //     "ratio": "16:9",
            //     "frameRate": 15
            // },
            // {
            //     "label": "QCIF",
            //     "width": 176,
            //     "height": 144,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "QCIF",
            //     "width": 176,
            //     "height": 144,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // },
            // {
            //     "label": "QQVGA",
            //     "width": 160,
            //     "height": 120,
            //     "ratio": "4:3",
            //     "frameRate": 30
            // },
            // {
            //     "label": "QQVGA",
            //     "width": 160,
            //     "height": 120,
            //     "ratio": "4:3",
            //     "frameRate": 15
            // }
        ];
    }

    /***
     * 获取音视频设备并进行分类
     * @param deviceInfoCallback
     * @param error
     */
    MediaDevice.prototype.enumDevices = function(deviceInfoCallback, error) {
        if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined) {
            if (error) {
                error("browser don't support enumerate devices")
            }
            return
        }
        navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
            var microphone = []
            var speaker = []
            var camera = []
            var screenResolution = []
            var isConstraintsKeywordSupport = true
            for (var i = 0; i < deviceInfos.length; i++) {
                var deviceInfo = deviceInfos[i]
                if (deviceInfo.kind === 'audioinput') {
                    microphone.push({
                        label: deviceInfo.label,
                        deviceId: deviceInfo.deviceId,
                        groupId: deviceInfo.groupId,
                        status: 'available',
                    })
                }
                if (deviceInfo.kind === 'audiooutput') {
                    speaker.push({
                        label: deviceInfo.label,
                        deviceId: deviceInfo.deviceId,
                        groupId: deviceInfo.groupId,
                        status: 'available',
                    })
                }
                if (deviceInfo.kind === 'videoinput') {
                    camera.push({
                        label: deviceInfo.label,
                        deviceId: deviceInfo.deviceId,
                        groupId: deviceInfo.groupId,
                        status: 'available',
                        capability: []
                    })
                }
            }

            screenResolution.push({
                width: window.screen.width,
                height: window.screen.height,
            })

            if (deviceInfoCallback) {
                deviceInfoCallback({
                    microphones: microphone,
                    speakers: speaker,
                    cameras: camera,
                    screenResolution: screenResolution
                })
            }else {
                return {
                    microphones: microphone,
                    speakers: speaker,
                    cameras: camera,
                    screenResolution: screenResolution,
                    isConstraintsKeywordSupport: isConstraintsKeywordSupport
                }
            }
        }).catch(function (err) {
            if (error) {
                error(err)
            }
        })
    }

    /***
     * 更新localStorage存储
     * @param deviceInfos 所有的媒体数据
     * @param type ： cameras / microphones / speakers， 更新的类型
     */
    MediaDevice.prototype.updateDeviceInfo = function(deviceInfos, type){
        var localStorageDeviceInfo = JSON.parse(localStorage.getItem('mediaDevice'))
        var deviceInfoList = []
        var storageInfoList = []

        switch (type) {
            case 'cameras':
                deviceInfoList = deviceInfos.cameras
                storageInfoList = localStorageDeviceInfo ? localStorageDeviceInfo.cameras ? localStorageDeviceInfo.cameras : [] : []
                break
            case 'microphones':
                deviceInfoList = deviceInfos.microphones
                storageInfoList = localStorageDeviceInfo ? localStorageDeviceInfo.microphones ? localStorageDeviceInfo.microphones : [] : []
                break
            case 'speakers':
                deviceInfoList = deviceInfos.speakers
                storageInfoList = localStorageDeviceInfo? localStorageDeviceInfo.speakers ? localStorageDeviceInfo.speakers : [] : []
                break
            default:
                break
        }

        /***
         * 判断localStorage中的设备是否有还存在，不存在则设置状态为 unavailable，还存在的置为available
         * @param deviceInfoList
         * @param storageInfoList
         */
        function setDeviceStatus (deviceInfoList, storageInfoList) {
            for (var i = 0; i < storageInfoList.length; i++) {
                for(var j = 0; j < deviceInfoList.length; j++){
                    if(storageInfoList[i].label === deviceInfoList[j].label){
                        if(storageInfoList[i].status === 'unavailable'){
                            log.log('set device unavailable to available!')
                            storageInfoList[i].status = 'available'
                        }
                        storageInfoList[i].deviceId = deviceInfoList[j].deviceId
                        storageInfoList[i].groupId = deviceInfoList[j].groupId
                        break
                    }
                    if(storageInfoList[i].label !== deviceInfoList[j].label && j === deviceInfoList.length - 1 && storageInfoList[i].status !== 'unavailable'){
                        log.warn(storageInfoList[i].label + "   device is unavailable")
                        storageInfoList[i].status = 'unavailable'
                    }
                }
            }
        }

        /***
         * 判断设备是否是新设备，是的话，添加到localStorage中
         * @param deviceInfoList
         * @param storageInfoList
         */
        function addInsertDevice(deviceInfoList, storageInfoList){
            for(var i = 0; i < deviceInfoList.length; i++){
                for(var j = 0; j < storageInfoList.length; j++){
                    if(deviceInfoList[i].label === storageInfoList[j].label){
                        storageInfoList[j].deviceId = deviceInfoList[i].deviceId
                        storageInfoList[j].groupId = deviceInfoList[i].groupId
                        break
                    }
                    if( deviceInfoList[i].label !== storageInfoList[j].label && j === storageInfoList.length - 1){
                        log.warn("new device has been insert!")
                        storageInfoList.push(deviceInfoList[i])
                    }
                }
            }
        }

        // 本地存储没有任何值，直接设置获取的设备列表到localStorage中
        if(deviceInfoList.length && !storageInfoList.length){
            log.warn("set new device info list")
            localStorage.setItem('mediaDevice',  JSON.stringify(deviceInfos, null, '    '))
            return
        }

        // 未获取当任何有效的设备列表，localStorage保存的设备全部设置为不可用
        if(!deviceInfoList.length && storageInfoList.length){
            log.warn('set all device to unavailable');
            for (var i = 0; i < storageInfoList.length; i++){
                storageInfoList[i].status = 'unavailable'
            }
            localStorage.setItem('mediaDevice',  JSON.stringify(localStorageDeviceInfo, null, '    '))
            return
        }

        // 获取到设备列表，且localStorage中有设备存储信息
        setDeviceStatus(deviceInfoList, storageInfoList)
        addInsertDevice(deviceInfoList, storageInfoList)
        log.log('update modified device info into localStorage!')
        localStorage.setItem('mediaDevice',  JSON.stringify(localStorageDeviceInfo, null, '    '))
    }

    /***
     * 清除流
     * @param stream
     */
    MediaDevice.prototype.closeStream = function(stream){
        var tracks = stream.getTracks();
        for (var track in tracks) {
            tracks[track].onended = null;
            log.info("close stream");
            tracks[track].stop();
        }
    }

    /***
     * 判断取流是否支持关键字：min/max/exact/ideal
     * 常见：测试一体机不支持关键字
     * @returns {Promise<boolean>}
     */
    MediaDevice.prototype.isConstraintsKeywordSupport = async function(){
        var This = this
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
                This.closeStream(stream)
            }).catch(function () {
                log.info('ideal is not support')
                result = false
            })
        }catch (error) {
            result = false
        }

        log.info('is constraints Keyword support: ', result)
        return result
    }

    /***
     * 使用exact关键字取流
     * @returns {Promise<void>}
     */
    MediaDevice.prototype.getStreamUseExactConstraints = async function(){
        var This = this
        var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
        var quickScanList = This.getQuickScanList()
        var localStream
        var constraints

        for (var j = 0; j < mediaDevice.cameras.length; j++) {
            // 换摄像头时需要重新取流，避免使用applyConstraints时不换摄像头的场景
            if (localStream) {
                This.closeStream(localStream)
            }
            // 当前循环设备之前已经有分辨率扫描的记录，不重新扫描
            if (mediaDevice.cameras[j].capability && mediaDevice.cameras[j].capability.length > 0) {
                log.log("this device has already get resolution before!")
                continue
            }

            log.warn("Current scan device：", mediaDevice.cameras[j].label)
            var deviceId = mediaDevice.cameras[j].deviceId
            var capability = mediaDevice.cameras[j].capability

            function getNewStreamSuccess() {
                capability.push({
                    width: quickScanList[i].width,
                    height: quickScanList[i].height,
                    frameRate: quickScanList[i].frameRate,
                    aspectRatio: quickScanList[i].ratio
                })

                if (j === mediaDevice.cameras.length - 1 && i === quickScanList.length - 1) {
                    log.log("Resolution scan completed, clear stream.")
                    This.closeStream(localStream)
                }
            }

            function getNewStreamFailed() {
                log.warn('device has not support this resolution: ',
                    JSON.stringify({
                        width: quickScanList[i].width,
                        height: quickScanList[i].height,
                        frameRate: quickScanList[i].frameRate,
                        aspectRatio: quickScanList[i].width / quickScanList[i].height
                    }, null, '    ')
                )
            }

            // 存在问题：不使用关键字时，applyConstraints和getUserMedia取流都存在不准确问题，比如1920*1080，摄像头不支持该分辨率也能取流成功，因为取的是别的分辨率
            for (var i = 0; i < quickScanList.length; i++) {
                var videoTrack = localStream ? localStream.getVideoTracks()[0] : null
                if (localStream && localStream.active === true && localStream.getVideoTracks().length > 0 && videoTrack.applyConstraints) {
                    constraints = {
                        frameRate: {exact: quickScanList[i].frameRate},
                        aspectRatio: {exact: quickScanList[i].width / quickScanList[i].height},
                        width: {exact: quickScanList[i].width},
                        height: {exact: quickScanList[i].height}
                    }

                    await videoTrack.applyConstraints(constraints).then(function () {
                        log.info('applyConstraints success' + JSON.stringify(constraints, null, '    '))
                        getNewStreamSuccess(null)
                    }).catch(function (error) {
                        log.warn('applyConstraints error: ', error.name)
                        getNewStreamFailed()
                    })
                } else {
                    constraints = {
                        audio: false,
                        video: {
                            deviceId: deviceId ? {exact: deviceId} : "",
                            frameRate: {exact: quickScanList[i].frameRate},
                            aspectRatio: {exact: quickScanList[i].width / quickScanList[i].height},
                            width: {exact: quickScanList[i].width},
                            height: {exact: quickScanList[i].height}
                        }
                    }

                    await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                        log.info("getUserMedia success!" + JSON.stringify(constraints, null, '    '))
                        localStream = stream
                        getNewStreamSuccess()
                    }).catch(function (error) {
                        log.warn(error.name)
                        getNewStreamFailed()
                    })
                }
            }
        }
        localStorage.setItem('mediaDevice', JSON.stringify(mediaDevice, null, '    '))
    }

    /***
     * 兼容不支持min/max/ideal/exact的情况，使用{audio:false, video: { width: 1280, height: 720}} 格式取流
     * 通过取流后的video实际尺寸判断取流是否成功
     */
    window.onloadeddata = function(){
        window.cameraPrev = document.getElementById('cameraPrev')
        cameraPrev.onloadedmetadata =  MediaDevice.prototype.displayVideoDimensions;
    }

    MediaDevice.prototype.displayVideoDimensions = function(scanListIndex, cameraIndex) {
        var This = this
        var i = scanListIndex
        var j = cameraIndex
        var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
        var capability = mediaDevice.cameras[j].capability
        var quickScanList = This.getQuickScanList()
        log.log("Video onloadedmetadata call~~~");

        function captureResults(data) {
            if(data.result === true){
                log.log("pass")
                capability.push({
                    width: quickScanList[i].width,
                    height: quickScanList[i].height,
                    frameRate: quickScanList[i].frameRate,
                    aspectRatio: quickScanList[i].ratio
                })
                localStorage.setItem('mediaDevice', JSON.stringify(mediaDevice, null, '    '))
            }else {
                log.log("fail: mismatch")
            }

            i++
            if( i< quickScanList.length){
                window.isCameraScan = false
                This.getSteamUseNormalConstraints(i, j)
            }else  if(j < mediaDevice.cameras.length - 1){
                window.isCameraScan = true
                This.closeStream(stream)
                j++;
                i=0;
                This.getSteamUseNormalConstraints(i, j)
            }else {
                This.closeStream(stream)
                log.log("End of scan ~~")
            }
        }

        if (!cameraPrev.videoWidth) {
            setTimeout(function () {
                This.displayVideoDimensions(scanListIndex, cameraIndex)
            }, 500);  //was 500
        }

        if (cameraPrev.videoWidth * cameraPrev.videoHeight > 0) {
            log.log("Display size for : " + quickScanList[scanListIndex].width  + "x" + quickScanList[scanListIndex].height);
            log.log("Stream dimensions for :" + cameraPrev.videoWidth + "x" + cameraPrev.videoHeight);
            if(quickScanList[scanListIndex].width + "x" + quickScanList[scanListIndex].height !== cameraPrev.videoWidth + "x" + cameraPrev.videoHeight){
                log.warn("pass: " + quickScanList[scanListIndex].width  + "x" + quickScanList[scanListIndex].height)
                captureResults({result: false})
            }
            else{
                log.warn("fail: mismatch :" + quickScanList[scanListIndex].width  + "x" + quickScanList[scanListIndex].height)
                captureResults({result: true})
            }
        }

    }

    MediaDevice.prototype.getSteamUseNormalConstraints = async function(scanListIndex, cameraIndex){
        var This = this
        var quickScanList = This.getQuickScanList()
        var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
        var i = scanListIndex
        var j = cameraIndex
        var mediaStream = window.stream
        var deviceId = mediaDevice.cameras[j].deviceId
        var capability = mediaDevice.cameras[j].capability
        var constraints;

        // 当前循环设备之前已经有分辨率扫描的记录，不重新扫描
        if (window.isCameraScan === true && capability && capability.length > 0) {
            log.warn("this device has already get resolution before: " + mediaDevice.cameras[j].label)
            cameraIndex ++
            if(cameraIndex < mediaDevice.cameras.length){
                log.warn('Scan the next device')
                This.getSteamUseNormalConstraints(scanListIndex, cameraIndex)
            }
            return
        }
        window.isCameraScan = false

        function getNewStreamSuccess() {
            log.log("Display size for " + quickScanList[i].label + ": " + quickScanList[i].width + "x" + quickScanList[i].height);
            setTimeout(function () {
                This.displayVideoDimensions(scanListIndex, cameraIndex)
            }, 2000);
        }

        log.warn("Current scan device：", mediaDevice.cameras[j].label)
        var videoTrack = mediaStream ? mediaStream.getVideoTracks()[0] : null
        if (mediaStream && mediaStream.active === true && mediaStream.getVideoTracks().length > 0 && videoTrack.applyConstraints) {
            constraints = {
                frameRate: quickScanList[i].frameRate ,
                width: quickScanList[i].width ,
                height: quickScanList[i].height,
                aspectRatio: {exact: quickScanList[i].width / quickScanList[i].height},
            }

            await videoTrack.applyConstraints(constraints).then(function () {
                log.info('applyConstraints success' + JSON.stringify(constraints, null, '    '))
                getNewStreamSuccess()
            }).catch(function (error) {
                log.warn('applyConstraints error: ', error.name)
            })
        } else {
            constraints = {
                audio: false,
                video: {
                    deviceId: deviceId,
                    frameRate: quickScanList[i].frameRate,
                    width: quickScanList[i].width,
                    height: quickScanList[i].height,
                    aspectRatio: {exact: quickScanList[i].width / quickScanList[i].height},
                }
            }

            await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                log.info("getUserMedia success!" + JSON.stringify(constraints, null, '    '))
                window.stream = stream
                cameraPrev.srcObject = stream
                getNewStreamSuccess()
            }).catch(function (error) {
                log.error(error)
            })
        }
    }

    /***
     * 设置设备所支持的取流能力：frameRate, width, height
     */
    MediaDevice.prototype.setDeviceCapability = async function () {
        var This = this
        var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
        // 判断取流是否支持关键字设置
        var isKeywordSupport = await This.isConstraintsKeywordSupport()
        mediaDevice.isConstraintsKeywordSupport = isKeywordSupport

        if(mediaDevice && mediaDevice.cameras.length > 0){
            // if(isKeywordSupport === true) {
            //     log.warn("min/max/ideal/exact keyWord is support")
            //     This.getStreamUseExactConstraints()
            // }else {
                log.warn("min/max/ideal/exact keyWord is  NOT support")
                window.isCameraScan = true
                This.getSteamUseNormalConstraints(0, 0)

            // }
        }else {
            log.warn('no cameras need to resolution scan!')
        }
    }

    /***
     * 检查可用设备列表
     */
    MediaDevice.prototype.checkAvailableDev = function () {
        var This = this

        This.enumDevices(function(deviceInfo){
            // log.log("get device info success: \n", JSON.stringify(deviceInfo))
            function setLabel (devices, type) {
                for (var key = 0; key < devices.length; key++) {
                    if (!devices[key].label) {
                        devices[key].label = type + key
                    }
                    log.log(type + " " +devices[key].label)
                }
                return devices
            }

            if(deviceInfo){
                if(deviceInfo.cameras){
                    setLabel(deviceInfo.cameras, 'cameras')
                }
                if(deviceInfo.microphones){
                    setLabel(deviceInfo.microphones, 'microphones')
                }
                if(deviceInfo.speakers){
                    setLabel(deviceInfo.speakers, 'speakers')
                }

                This.updateDeviceInfo(deviceInfo, "cameras")
                This.updateDeviceInfo(deviceInfo, "microphones")
                This.updateDeviceInfo(deviceInfo, "speakers")
            }else {
                log.warn("deviceInfo is null")
            }

        }, function (error) {
            log.error('enum device error: ' + error.toString())
        })
    }

    /***
     * 设备定时检查开关
     * @param switchOn: true 开启定时器；  false 关闭定时器
     */
    MediaDevice.prototype.setDeviceCheckInterval = function (switchOn) {
        var This = this
        if(switchOn){
            clearInterval(This.deviceCheckTimer)
            This.deviceCheckTimer = setInterval(function () {
                This.checkAvailableDev()
            }, 1000)
        }else {
            clearInterval(This.deviceCheckTimer);
            This.deviceCheckTimer = null
        }
    }

    /***
     * 获取最接近，最合适的设备支持的分辨率
     * @param expectRes 当前希望获取的分辨率，eg {
     *   deviceId: 4b5305afd805f2d8439eac80dc94b14846799929d44d18c7dd8fc97eda75c046
     *   frameRate: 15,
     *   width: 1080,
     *   height: 720
     * }
     */
    MediaDevice.prototype.getSuitableResolution = function (expectRes) {
        if(!expectRes.deviceId || !expectRes.width || !expectRes.height || !expectRes.frameRate){
            log.warn('Invalid parameter');
            return
        }

        var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
        var capability = []
        var sameWidthList = []
        var matchRes = {}

        if(mediaDevice && mediaDevice.cameras.length > 0){
            // 获取给定设备支持的取流能力列表
            for(var i = 0; i < mediaDevice.cameras.length; i++){
                if(mediaDevice.cameras[i].deviceId === expectRes.deviceId){
                    capability = mediaDevice.cameras[i].capability
                    log.warn("capability: ", capability)
                    break
                }
            }

            // 过滤出相同width的分辨率
            if(capability.length > 0){
                for(var j = 0; j < capability.length; j++){
                    if(capability[j].width === expectRes.width){
                        sameWidthList.push(capability[j])
                    }
                }
                log.warn("sameWidthList: ", sameWidthList)
            }

            // 获取最合适的分辨率
            if(sameWidthList.length > 0){
                for(var k = 0; k < sameWidthList.length; k++){
                    // 返回width height frameRate 都相同的分辨率
                    if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height === expectRes.height && sameWidthList[k].frameRate === expectRes.frameRate){
                        log.warn('Returns the resolution of width height frameRate', sameWidthList[k])
                        matchRes = sameWidthList[k]
                        break
                    }
                }

                if(JSON.stringify(matchRes) === "{}"){
                    for(var k = 0; k < sameWidthList.length; k++){
                        // 返回width height相同， frameRate 小于期望值的的分辨率
                        if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height === expectRes.height && sameWidthList[k].frameRate < expectRes.frameRate){
                            log.warn('Returns the resolution where the width height is the same and the frameRate is less than the expected value. ', sameWidthList[k])
                            matchRes = sameWidthList[k]
                            break
                        }
                    }
                }

                if(JSON.stringify(matchRes) === "{}"){
                    for(var k = 0; k < sameWidthList.length; k++){
                        // 返回width frameRate 相同， height 小于期望值的的分辨率
                        if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height < expectRes.height && sameWidthList[k].frameRate === expectRes.frameRate){
                            log.warn('Returns the resolution where the width height is the same and the frameRate is less than the expected value. ', sameWidthList[k])
                            matchRes = sameWidthList[k]
                            break
                        }
                    }
                }
            }else {
                log.warn("no same with resolution exist, get other resolution;")
                // 返回设备支持的最大的、width比期望值小的分辨率
                for(var j = 0; j < capability.length; j++){
                    if(capability[j].width < expectRes.width){
                        log.log('Returns the maximum resolution supported by the device with a smaller width than expected')
                        matchRes = capability[j]
                        break
                    }
                }
            }
            return matchRes
        }
        return matchRes
    }

    return MediaDevice;

}));