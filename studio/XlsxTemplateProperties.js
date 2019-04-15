import React, { Component } from 'react'
import Studio from 'jsreport-studio'

const EntityRefSelect = Studio.EntityRefSelect

function selectAssets (entities) {
  return Object.keys(entities).filter((k) => entities[k].__entitySet === 'assets').map((k) => entities[k])
}

class Properties extends Component {
  componentDidMount () {
    this.removeInvalidReferences()
  }

  componentDidUpdate () {
    this.removeInvalidReferences()
  }

  removeInvalidReferences () {
    const { entity, entities, onChange } = this.props

    if (!entity.xlsxTemplateRecipe) {
      return
    }

    const updatedAssetItems = Object.keys(entities).filter((k) => entities[k].__entitySet === 'assets' && entities[k].shortid === entity.xlsxTemplateRecipe.templateAssetShortid)

    if (updatedAssetItems.length === 0) {
      onChange({ _id: entity._id, xlsxTemplateRecipe: null })
    }
  }

  static title (entity, entities) {
    if (!entity.xlsxTemplateRecipe || !entity.xlsxTemplateRecipe.templateAssetShortid) {
      return 'xlsx template'
    }

    const foundItems = selectAssets(entities).filter((e) => entity.xlsxTemplateRecipe.templateAssetShortid === e.shortid)

    if (!foundItems.length) {
      return 'xlsx template'
    }

    return 'xlsx template: ' + foundItems[0].name
  }

  render () {
    const { entity, onChange } = this.props

    return (
      <div className='properties-section'>
        <div className='form-group'>
          <EntityRefSelect
            headingLabel='Select a xlsx template asset'
            filter={(references) => ({ assets: references.assets })}
            value={entity.xlsxTemplateRecipe ? entity.xlsxTemplateRecipe.templateAssetShortid : null}
            onChange={(selected) => onChange({ _id: entity._id, xlsxTemplateRecipe: selected.length > 0 ? { templateAssetShortid: selected[0].shortid } : null })}
          />
        </div>
      </div>
    )
  }
}

export default Properties
