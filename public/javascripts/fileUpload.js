
FilePond.registerPlugin(FilePondPluginImagePreview,
                         FilePondPluginImageResize,
                         FilePondPluginFileEncode,);
FilePond.setOptions({
    stylePanelAspectRatio: 15 / 10,
    imageResizeTargetWidth: 10,
    imageResizeTargetHeight: 15
})                         
FilePond.parse(document.body);