import { Plugin, ButtonView } from 'ckeditor5';

export default class AlignBoxPlugin extends Plugin {

    init() {
        console.log( 'Custom plugin was initialized.' );
        // const editor = this.editor;
        // editor.ui.componentFactory.add('alignBox', () => {
        //     const button = new ButtonView();
        //     button.set({
        //         label: 'Align Box',
                
        //     })
        // })
    }
}