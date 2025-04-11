// ===== 大型文件处理 - 最小化第1部分 =====

// 添加大型文件处理的配置
var largeFile = {
    // 配置
    SIZE_LIMIT: 20 * 1024 * 1024, // 20MB
    CHUNK_SIZE: 1024 * 1024, // 1MB块大小
    DISPLAY_LIMIT: 500 * 1024, // 界面显示限制（500KB）
    
    // 状态
    manager: {
        chunks: [],
        fileName: '',
        fileType: '',
        totalSize: 0,
        processed: 0,
        content: ''
    }
};

// 重置管理器函数
function resetLargeFileManager() {
    largeFile.manager.chunks = [];
    largeFile.manager.fileName = '';
    largeFile.manager.fileType = '';
    largeFile.manager.totalSize = 0;
    largeFile.manager.processed = 0;
    largeFile.manager.content = '';
}

// 添加样式
function addLargeFileStyles() {
    var styleEl = document.createElement('style');
    styleEl.id = 'large-file-styles';
    styleEl.textContent = '.progress-container { width: 100%; background-color: #f1f1f1; border-radius: 4px; margin: 10px 0; overflow: hidden; } .progress-bar { height: 20px; width: 0%; background-color: #4CAF50; text-align: center; line-height: 20px; color: white; } .large-file-info { margin: 10px 0; padding: 10px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px; }';
    document.head.appendChild(styleEl);
}

// 初始化样式
setTimeout(function() {
    addLargeFileStyles();
    console.log('大型文件处理样式已加载');
}, 1000);
