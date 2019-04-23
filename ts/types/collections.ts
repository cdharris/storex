import { Field } from '../fields/types'
import { FieldType } from "./fields"
import { IndexDefinition, IndexSourceFields } from './indices'
import { Relationships, RelationshipsByAlias } from './relationships'
import { MigrationRunner } from './migrations'

export type CollectionDefinitionMap = {[name : string] : CollectionDefinitions}

export type CollectionDefinitions =
    | CollectionDefinition[]
    | CollectionDefinition

export interface CollectionFields {
    [fieldName: string]: CollectionField
}

export interface CollectionField {
    type: FieldType
    optional?: boolean
    fieldObject?: Field
    _index?: number
}

export interface CollectionDefinition {
    version: Date
    fields: CollectionFields
    relationships?: Relationships
    indices?: IndexDefinition[]
    uniqueTogether?: string[][]
    groupBy? : { key : string, subcollectionName : string }[]
    
    // These are automatically deduced
    pkIndex?: IndexSourceFields
    relationshipsByAlias?: RelationshipsByAlias
    reverseRelationshipsByAlias?: RelationshipsByAlias
    fieldsWithCustomType?: string[]
    migrate?: MigrationRunner
    name?: string
    watch?: boolean // TODO: move this out of Storex
    backup?: boolean
}
