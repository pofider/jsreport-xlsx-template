const XlsxTemplate = require('xlsx-template')
const responseXlsx = require('./responseXlsx')

module.exports = function (reporter, definition) {
  definition.options = Object.assign({
    previewInExcelOnline: reporter.options.xlsx != null ? reporter.options.xlsx.previewInExcelOnline : undefined,
    publicUriForPreview: reporter.options.xlsx != null ? reporter.options.xlsx.publicUriForPreview : undefined,
    showExcelOnlineWarning: reporter.options.xlsx != null ? reporter.options.xlsx.showExcelOnlineWarning : undefined
  }, definition.options)

  // the public excel preview can be disabled just once in xlsx recipe
  const previewXlsxOptions = {
    previewInExcelOnline: definition.options.previewInExcelOnline,
    publicUriForPreview: definition.options.publicUriForPreview,
    showExcelOnlineWarning: definition.options.publicUriForPreview
  }

  reporter.documentStore.registerComplexType('XlsxTemplateRecipeType', {
    templateAssetShortid: { type: 'Edm.String' }
  })

  reporter.documentStore.model.entityTypes['TemplateType'].xlsxTemplateRecipe = { type: 'jsreport.XlsxTemplateRecipeType' }

  reporter.extensionsManager.recipes.push({
    name: 'xlsx-template',
    execute: async (req, response) => {
      if (!req.template.xlsxTemplateRecipe || (!req.template.xlsxTemplateRecipe.templateAsset && !req.template.xlsxTemplateRecipe.templateAssetShortid)) {
        throw reporter.createError(`xlsx-template recipe requires template.xlsxTemplateRecipe.templateAsset or template.xlsxTemplateRecipe.templateAssetShortid to be set`, {
          statusCode: 400
        })
      }

      let templateAsset = req.template.xlsxTemplateRecipe.templateAsset

      if (req.template.xlsxTemplateRecipe.templateAssetShortid) {
        templateAsset = await reporter.documentStore.collection('assets').findOne({ shortid: req.template.xlsxTemplateRecipe.templateAssetShortid }, req)

        if (!templateAsset) {
          throw reporter.createError(`Asset with shortid ${req.template.xlsxTemplateRecipe.templateAssetShortid} was not found`, {
            statusCode: 400
          })
        }
      } else {
        if (!Buffer.isBuffer(templateAsset.content)) {
          templateAsset.content = Buffer.from(templateAsset.content, templateAsset.encoding || 'utf8')
        }
      }

      let template = new XlsxTemplate(templateAsset.content)

      for (let i = 1; i < template.sheets.length + 1; i++) {
        template.substitute(i, req.data)
      }

      let result = template.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
      response.content = result

      return responseXlsx({
        ...previewXlsxOptions,
        readTempFileStream: reporter.readTempFileStream.bind(reporter),
        writeTempFile: reporter.writeTempFile.bind(reporter)
      }, req, response)
    }
  })

  reporter.beforeRenderListeners.insert({ before: 'templates' }, 'xlsx-template', (req) => {
    if (req.template && req.template.recipe === 'xlsx-template' && !req.template.name && !req.template.shortid && !req.template.content) {
      // templates extension otherwise complains that the template is empty
      // but that is fine for this recipe
      req.template.content = 'xlsx-template placeholder'
    }
  })

  reporter.initializeListeners.add('xlsx-template', () => {
    if (reporter.express) {
      reporter.express.exposeOptionsToApi(definition.name, {
        previewInExcelOnline: previewXlsxOptions.previewInExcelOnline,
        showExcelOnlineWarning: previewXlsxOptions.showExcelOnlineWarning
      })
    }
  })
}
