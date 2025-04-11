// ===== 大型文件处理 - 第1部分：基础配置和样式 =====

// 添加大型文件处理的配置
const largeFile = {
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
    },
    
    // 重置管理器
    resetManager: function() {
        this.manager.chunks = [];
        this.manager.fileName = '';
        this.manager.fileType = '';
        this.manager.totalSize = 0;
        this.manager.processed = 0;
        this.manager.content = '';
    }
};

// 添加样式
function addLargeFileStyles() {
    // 避免重复添加
    if (document.getElementById('large-file-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'large-file-styles';
    styleEl.innerHTML = `
        /* 进度条样式 */
        .progress-container {
            width: 100%;
            background-color: #f1f1f1;
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 20px;
            width: 0%;
            background-color: #4CAF50;
            text-align: center;
            line-height: 20px;
            color: white;
            transition: width 0.3s;
        }
        
        /* 大型文件信息框 */
        .large-file-info {
            margin: 10px 0;
            padding: 10px;
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            border-radius: 4px;
        }
    `;
    
    document.head.appendChild(styleEl);
}

// 初始化样式 (在页面加载后调用)
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行以确保不干扰原始脚本
    setTimeout(function() {
        addLargeFileStyles();
        console.log('大型文件处理样式已加载');
    }, 300);
});
