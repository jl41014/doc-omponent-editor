import { Plugin, icons, ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5';
import type { RawHtmlApi } from './AlignBoxEditing';
import AlignBoxCommand from './AlignBoxCommand';

export default class AlignBoxUI extends Plugin {

    public static get pluginName() {
		return 'AlignBoxUI' as const;
	}

    init() {
        const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;

		// Add the `htmlEmbed` button to feature components.
		editor.ui.componentFactory.add( 'alignBox', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true,
				label: t( 'Insert Align Box' )
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:alignBox', () => {
			const buttonView = this._createButton( MenuBarMenuListItemButtonView );

			buttonView.set( {
				label: t( 'HTML snippet' )
			} );

			return buttonView;
		} );
    }

    private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const command: AlignBoxCommand = editor.commands.get( 'alignBox' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;

		view.set( {
			icon: icons.html
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'alignBox' );
			editor.editing.view.focus();

			const rawHtmlApi = editor.editing.view.document.selection
				.getSelectedElement()!
				.getCustomProperty( 'rawHtmlApi' ) as RawHtmlApi;

			rawHtmlApi.makeEditable();
		} );

		return view;
	}

}