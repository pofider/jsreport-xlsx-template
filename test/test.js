
const jsreport = require('jsreport-core')
const fs = require('fs')
const path = require('path')
const XlsxPopulate = require('html-to-xlsx').XlsxPopulate
require('should')

describe('xlsx-template', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport({
      templatingEngines: {
        strategy: 'in-process'
      }
    }).use(require('../')())
      .use(require('jsreport-templates')())
      .use(require('jsreport-assets')())
    return reporter.init()
  })

  afterEach(() => reporter.close())

  it('should produce excel with replaced tags', async () => {
    const result = await reporter.render({
      template: {
        engine: 'none',
        recipe: 'xlsx-template',
        xlsxTemplateRecipe: {
          templateAsset: {
            content: fs.readFileSync(path.join(__dirname, 'template.xlsx'))
          }
        }
      },
      data: {
        foo: 'John'
      }
    })

    const workbook = await XlsxPopulate.fromDataAsync(result.content)
    workbook.sheets().length.should.be.eql(1)
    workbook.sheets()[0].cell(1, 1).value().should.be.eql('John')
  })
})
