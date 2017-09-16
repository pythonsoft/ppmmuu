

class TemplateInfo {
  constructor() {
    this.struct = {
      templateName: { type: 'string', validation: 'require' }, // 模板名称
      templateCode: { type: 'string', validation: 'require' }, // 模板编码
      fileformat: { type: 'string', validation: 'require' },   // 容器格式(必填) mp4 mxf mov
      enablevideo: { type: 'string', validation: 'require', default() { return 'true'; } },  // 是否包含视频流(必填)  true false
      vcodec: { type: 'string', validation: 'require' },  // 视频流编码格式(必填)  libx264  mpeg2video prores
      pixfmt: { type: 'string', validation: 'require' },  // 视频采样格式  yuv420p yuv422p yuyv422 yuv422p10le
      gop: { type: 'string' },    // 图像组数量
      ref: { type: 'string' },    // reframes参考帧
      w: { type: 'string', validation: 'require' }, // 视频宽(必填) 1920x1080   1280x720   640x360
      h: { type: 'string', validation: 'require' }, // 视频高(必填)
      vbitrate: { type: 'string' }, // 视频比特率
      framerate: { type: 'string' },   // 视频帧率
      progressive: { type: 'string' }, // 逐行扫描   true false
      scaletype: { type: 'string' },   // zoom:缩放   box:黑边     cut:剪切
      bframes: { type: 'string' },     // b帧数量
      level: { type: 'string' },       // profile  baseline main high SQ HQ 3.1 4.0.4.1
      tsbitrate: { type: 'string' },   // ts流比特率
      watermarkFile: { type: 'string' }, // 水印
      leftmargin: { type: 'string' },    // 水印left边距
      topmargin: { type: 'string' },     // 水印top边距
      enableaudio: { type: 'string', validation: 'require' }, // 是否包含音频流(必填) true false
      acodec: { type: 'string', validation: 'require' },      // 音频编码格式(必填)   libfdk_aac pcm_s16le mp2
      channels: { type: 'string' }, // 音频通道数量
      samplerate: { type: 'string', validation: 'require' },  // 音频采样率(必填)   48000  44100
      abitrate: { type: 'string' }, // 音频比特率
      enableAudioMap: { type: 'string', validation: 'require' }, // 是否支持多音轨 true false
      audioIndexs: { type: 'string' }, // 音轨index
    };
  }
}

module.exports = TemplateInfo;
