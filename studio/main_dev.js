import Properties from './XlsxTemplateProperties'
import Studio from 'jsreport-studio'

Studio.addPropertiesComponent(Properties.title, Properties, (entity) => entity.__entitySet === 'templates' && entity.recipe === 'xlsx-template')

Studio.addApiSpec({
  template: {
    xlsxTemplateRecipe: {
      templateAsset: {
        content: '...'
      },
      templateAssetShortid: '...'
    }
  }
})

Studio.previewListeners.push((request, entities) => {
  if (request.template.recipe !== 'xlsx-template') {
    return
  }

  if (Studio.extensions['xlsx-template'].options.previewInOfficeOnline === false) {
    return
  }

  if (Studio.getSettingValueByKey('office-preview-informed', false) === true) {
    return
  }

  Studio.setSetting('office-preview-informed', true)

  Studio.openModal(() => <div>
    We need to upload your xlsx report to our publicly hosted server to be able to use
    Office Online Service for previewing here in the studio. You can disable it in the configuration, see <a
      href='https://github.com/ju-bezdek/jsreport-xlsx-template' target='_blank'>https://github.com/ju-bezdek/jsreport-xlsx-template</a> for details.
  </div>)
})
