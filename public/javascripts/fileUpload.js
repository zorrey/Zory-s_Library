const rootStyles =  window.getComputedStyle(document.documentElement)

if(rootStyles.getPropertyValue('--book-cover-width-large') != null &&
rootStyles.getPropertyValue('--book-cover-width-large') != ''  ){
    ready()
}else{
    document.getElementById('main-css').addEventListener('load', ready)
}

function ready(){
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'))
    const coverRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'))
    const coverHeight = coverWidth / coverRatio
    const maxSize = 50000

    FilePond.registerPlugin(FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode);
    FilePond.registerPlugin(FilePondPluginFileValidateSize);    
    FilePond.setOptions({
    maxFileSize: maxSize,
    })
    FilePond.setOptions({
    stylePanelAspectRatio: 1/coverRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight
    })                         
    FilePond.parse(document.body);
}

