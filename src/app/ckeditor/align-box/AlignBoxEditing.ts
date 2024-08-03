import {
  Editor,
  Plugin,
  ButtonView,
  DowncastWriter,
  ViewContainerElement,
  createElement,
  toWidget,
  icons
} from 'ckeditor5';
import AlignBoxCommand from './AlignBoxCommand';
import { AlignBoxConfig } from './AlignBoxConfig';

interface State {
  showPreviews: AlignBoxConfig['showPreviews'];
  isEditable: boolean;
  getRawHtmlValue(): string;
}

interface Props {
  sanitizeHtml: AlignBoxConfig['sanitizeHtml'];
  textareaPlaceholder: string;
  onEditClick(): void;
  onSaveClick(newValue: string): void;
  onCancelClick(): void;
}

export interface RawHtmlApi {
	makeEditable(): void;
	save( newValue: string ): void;
	cancel(): void;
}

export default class AlignBoxEditing extends Plugin {
  private _widgetButtonViewRef: Set<ButtonView> = new Set();

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;
    schema.register('alignBox', {
      inheritAllFrom: '$blockObject',
      allowAttributes: [],
    });

    editor.commands.add('alignBox', new AlignBoxCommand(editor));

    this._setupConversion();
  }

  public static get pluginName() {
    return 'AlignBoxEditing' as const;
  }

  constructor(editor: Editor) {
    super(editor);

    editor.config.define('AlignBox', {
      showPreviews: false,
      sanitizeHtml: (rawHtml: any) => {
        return {
          html: rawHtml,
          hasChanged: false,
        };
      },
    });
  }

  private _setupConversion() {
    const editor = this.editor;
    const t = editor.t;
    const view = editor.editing.view;
    const widgetButtonViewRef = this._widgetButtonViewRef;
    const alignBoxConfig: AlignBoxConfig = editor.config.get('alignBox')!;

    this.editor.editing.view.on(
      'render',
      () => {
        widgetButtonViewRef.forEach((buttonView) => {
          if (buttonView.element && buttonView.element.isConnected) {
            return;
          }
          buttonView.destroy();
          widgetButtonViewRef.delete(buttonView);
        });
      },
      { priority: 'lowest' }
    );

    editor.data.registerRawContentMatcher({
      name: 'div',
      classes: 'align-box-container',
    });

    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'div',
        classes: 'align-box-container',
      },
      model: (viewElement, { writer }) => {
        return writer.createElement('alignBox', {
          value: viewElement.getCustomProperty('$rawContent'),
        });
      },
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: 'alignBox',
      view: (modelElement, { writer }) => {
        return writer.createRawElement(
          'div',
          { class: 'align-box-container' },
          function (domElement) {
            domElement.innerHTML =
              (modelElement.getAttribute('value') as string) || '';
          }
        );
      },
    });

    editor.conversion.for('editingDowncast').elementToStructure({
      model: { name: 'alignBox', attributes: ['value'] },
      view: (modelElement, { writer }) => {
        let domContentWrapper: HTMLElement;
        let state: State;
        let props: Props;

        const viewContentWrapper = writer.createRawElement(
          'div',
          {
            class: 'align-box__content-wrapper',
          },
          (domElement) => {
            domContentWrapper = domElement;
            domContentWrapper.addEventListener(
              'mousedown',
              () => {
                if (state.isEditable) {
                  const model = editor.model;
                  const selectedElement =
                    model.document.selection.getSelectedElement();
                  if (selectedElement !== modelElement) {
                    model.change((writer) =>
                      writer.setSelection(modelElement, 'on')
                    );
                  }
                }
              },
              true
            );
          }
        );

        const alignBoxApi = {
          makeEditable() {
            state = Object.assign({}, state, {
              isEditable: true,
            });

            renderContent({
              domElement: domContentWrapper,
              editor,
              state,
              props,
            });

            view.change((writer) => {
              writer.setAttribute(
                'data-cke-ignore-events',
                'true',
                viewContentWrapper
              );
            });
          },

          save(newValue: string) {
            if (newValue !== state.getRawHtmlValue()) {
              editor.execute('alignBox', newValue);
              editor.editing.view.focus();
            } else {
              this.cancel();
            }
          },

          cancel() {
            state = Object.assign({}, state, {
              isEditable: false,
            });

            renderContent({
              domElement: domContentWrapper,
              editor,
              state,
              props,
            });

            editor.editing.view.focus();

            view.change((writer) => {
              writer.removeAttribute(
                'data-cke-ignore-events',
                viewContentWrapper
              );
            });
          },
        };

        state = {
          showPreviews: alignBoxConfig.showPreviews,
          isEditable: false,
          getRawHtmlValue: () =>
            (modelElement.getAttribute('value') as string) || '',
        };

        props = {
          sanitizeHtml: alignBoxConfig.sanitizeHtml,
          textareaPlaceholder: t('Paste raw HTML here...'),
          onEditClick: () => alignBoxApi.makeEditable(),
          onSaveClick: (newValue: string) => alignBoxApi.save(newValue),
          onCancelClick: () => alignBoxApi.cancel(),
        };

        const viewContainer = writer.createContainerElement(
          'div',
          {
            class: 'raw-align-box',
            'data-align-box-label': t('HTML snippet'),
            dir: editor.locale.uiLanguageDirection,
          },
          viewContentWrapper
        );

        writer.setCustomProperty('alignBoxApi', alignBoxApi, viewContainer);
        writer.setCustomProperty('alignBox', true, viewContainer);

        return toWidget(viewContainer, writer, {
          label: t('HTML snippet'),
          hasSelectionHandle: true,
        });
      },
    });

    function renderContent({
      editor,
      domElement,
      state,
      props,
    }: {
      editor: Editor;
      domElement: HTMLElement;
      state: State;
      props: Props;
    }) {
      domElement.textContent = '';
      const domDocument = domElement.ownerDocument;
      let domTextarea: HTMLTextAreaElement;

      if (state.isEditable) {
        const textAreaProps = {
          isDisabled: false,
          placeholder: props.textareaPlaceholder,
        };

        domTextarea = createDomTextarea({
          domDocument,
          state,
          props: textAreaProps,
        });

        domElement.appendChild(domTextarea);
      } else if (state.showPreviews) {
        const previewContainerProps = {
          sanitizeHtml: props.sanitizeHtml,
        };

        domElement.append(
          createPreviewContainer({
            domDocument,
            state,
            props: previewContainerProps,
            editor,
          })
        );
      } else {
        const textareaProps = {
          isDisabled: true,
          placeholder: props.textareaPlaceholder,
        };

        domElement.append(
          createDomTextarea({ domDocument, state, props: textareaProps })
        );
      }

      const buttonsWrapperProps = {
        onEditClick: props.onEditClick,
        onSaveClick: () => {
          props.onSaveClick(domTextarea.value);
        },
        onCancelClick: props.onCancelClick,
      };

      domElement.prepend(
        createDomButtonsWrapper({
          editor,
          domDocument,
          state,
          props: buttonsWrapperProps,
        })
      );
    }

    function createDomTextarea({
      domDocument,
      state,
      props,
    }: {
      domDocument: Document;
      state: State;
      props: {
        isDisabled: boolean;
        placeholder: string;
      };
    }): HTMLTextAreaElement {
      const domTextarea = createElement(domDocument, 'textarea', {
        placeholder: props.placeholder,
        class: 'ck ck-reset ck-input ck-input-text raw-align-box__source',
      });

      domTextarea.disabled = props.isDisabled;
      domTextarea.value = state.getRawHtmlValue();

      return domTextarea;
    }

    function createDomButtonsWrapper({
      editor,
      domDocument,
      state,
      props,
    }: {
      editor: Editor;
      domDocument: Document;
      state: State;
      props: Pick<Props, 'onEditClick' | 'onCancelClick'> & {
        onSaveClick(): void;
      };
    }): HTMLDivElement {
      const domButtonsWrapper = createElement(domDocument, 'div', {
        class: 'raw-align-box__buttons-wrapper',
      });

      if (state.isEditable) {
        const saveButtonView = createUIButton(
          editor,
          'save',
          props.onSaveClick
        );
        const cancelButtonView = createUIButton(
          editor,
          'cancel',
          props.onCancelClick
        );
        domButtonsWrapper.append(
          saveButtonView.element!,
          cancelButtonView.element!
        );
        widgetButtonViewRef.add(saveButtonView).add(cancelButtonView);
      } else {
        const editButtonView = createUIButton(
          editor,
          'edit',
          props.onEditClick
        );
        domButtonsWrapper.append(editButtonView.element!);
        widgetButtonViewRef.add(editButtonView);
      }

      return domButtonsWrapper;
    }

    function createPreviewContainer({
      editor,
      domDocument,
      state,
      props,
    }: {
      editor: Editor;
      domDocument: Document;
      state: State;
      props: {
        sanitizeHtml: AlignBoxConfig['sanitizeHtml'];
      };
    }): HTMLDivElement {
      const sanitizedOutput = props.sanitizeHtml!(state.getRawHtmlValue());
      const placeholderText =
        state.getRawHtmlValue().length > 0
          ? t('No preview available')
          : t('Empty snippet content');

      const domPreviewPlaceholder = createElement(
        domDocument,
        'div',
        {
          class: 'ck ck-reset_all raw-align-box__preview-placeholder',
        },
        placeholderText
      );

      const domPreviewContent = createElement(domDocument, 'div', {
        class: 'raw-align-box__preview-content',
        dir: editor.locale.contentLanguageDirection,
      });

      const domRange = document.createRange();
      const domDocumentFragment = domRange.createContextualFragment(
        sanitizedOutput.html
      );
      domPreviewContent.appendChild(domDocumentFragment);

      const domPreviewContainer = createElement(
        domDocument,
        'div',
        {
          class: 'raw-align-box__preview',
        },
        [domPreviewPlaceholder, domPreviewContent]
      );

      return domPreviewContainer;
    }
  }
}

function createUIButton(editor: Editor, type: 'edit' | 'save' | 'cancel', onClick: () => void): ButtonView {
  const { t } = editor.locale;
  const buttonView = new ButtonView(editor.locale); 
  const command: AlignBoxCommand = editor.commands.get('alignBox')!;
  buttonView.set({
    class: `raw-align-box__${type}-button`,
    icon: icons.pencil,
    tooltip: true,
    tooltipPosition: editor.locale.uiLanguageDirection === 'rtl' ? 'e' : 'w'
  })

  buttonView.render();

  if ( type === 'edit' ) {
		buttonView.set( {
			icon: icons.pencil,
			label: t( 'Edit source' )
		} );

		buttonView.bind( 'isEnabled' ).to( command );
	} else if ( type === 'save' ) {
		buttonView.set( {
			icon: icons.check,
			label: t( 'Save changes' )
		} );

		buttonView.bind( 'isEnabled' ).to( command );
	} else {
		buttonView.set( {
			icon: icons.cancel,
			label: t( 'Cancel' )
		} );
	}

	buttonView.on( 'execute', onClick );

	return buttonView;

}

