import AlignBoxEditing from "./AlignBoxEditing";
import AlignBoxUI from "./AlignBoxUI";

import { Plugin } from 'ckeditor5';

export default class AlignBox extends Plugin {
    
    static get requires() {
        return [ AlignBoxEditing, AlignBoxUI ];
    }
}