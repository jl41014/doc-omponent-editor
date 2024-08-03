import { Command, findOptimalInsertionRange, DocumentSelection, Element, Model, Schema, Selection } from 'ckeditor5';

export default class AlignBoxCommand extends Command {
 
    public override refresh(): void {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;
		const selectedRawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		this.isEnabled = isAlignBoxAllowedInParent( selection, schema, model );
		this.value = selectedRawHtmlElement ? selectedRawHtmlElement.getAttribute( 'value' ) || '' : null;
	}

    public override execute( value?: string ): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			let alignBoxElement;

			// If the command has a non-null value, there must be some HTML embed selected in the model.
			if ( this.value !== null ) {
				alignBoxElement = getSelectedRawHtmlModelWidget( selection );
			} else {
				alignBoxElement = writer.createElement( 'rawHtml' );

				model.insertObject( alignBoxElement, null, null, { setSelection: 'on' } );
			}

			writer.setAttribute( 'value', value, alignBoxElement! );
		} );
	}
    
}

/**
 * Checks if an HTML embed is allowed by the schema in the optimal insertion parent.
 */
function isAlignBoxAllowedInParent( selection: DocumentSelection, schema: Schema, model: Model ): boolean {
	const parent = getInsertAlignBoxParent( selection, model );

	return schema.checkChild( parent, 'rawHtml' );
}

/**
 * Returns a node that will be used to insert a html embed with `model.insertContent` to check if a html embed element can be placed there.
 */
function getInsertAlignBoxParent( selection: Selection | DocumentSelection, model: Model ): Element {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent as Element;

	if ( parent.isEmpty && !parent.is( 'rootElement' ) ) {
		return parent.parent as Element;
	}

	return parent;
}

/**
 * Returns the selected HTML embed element in the model, if any.
 */
function getSelectedRawHtmlModelWidget( selection: DocumentSelection ): Element | null {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'rawHtml' ) ) {
		return selectedElement;
	}

	return null;
}