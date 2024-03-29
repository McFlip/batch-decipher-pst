/// <reference types="cypress" />
import '@testing-library/cypress/add-commands'
import {cert, keyfile} from '../../fixtures/cert.json'

describe('End to End App test', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080')
    })

    it('Case CRUD', () => {
        // Create a new case
        cy.findByRole('link', {name: 'here'}).click()
        cy.findByLabelText('Forensicator:').clear()
        cy.findByLabelText('Forensicator:').type('CRUD_inv')
        cy.findByLabelText('Case Name:').clear()
        cy.findByLabelText('Case Name:').type('CRUD_case')
        cy.findByRole('button', {name: 'Create'}).click()
        // Go back home and search for the case we just created
        cy.findByRole('link', {name: 'Home'}).click()
        cy.wait(100)
        cy.intercept('/cases/search*').as('caseSearch')
        cy.findByRole('textbox').type('CRUD')
        cy.findByRole('button', {name: 'Search'}).click()
        cy.wait('@caseSearch')
        cy.findByRole('button', {name: 'Select Case'}).click()
        cy.wait(100)
        cy.findByLabelText('Case Name:').should('have.value', 'CRUD_case')
        // Edit the case
        cy.findByLabelText('Custodians:').type('test edit')
        cy.intercept('patch', '/cases/*').as('caseUpdate')
        cy.findByRole('button', {name: 'Update'}).click()
        cy.wait('@caseUpdate')
        cy.findByText('test edit').should('exist')
        cy.wait(100)
        // Find the case again using Case name instead of Forensicator
        cy.findByRole('link', {name: 'Home'}).click()
        cy.wait(100)
        cy.findByRole('combobox').select('Case name')
        cy.findByRole('textbox').type('CRUD')
        cy.findByRole('button', {name: 'Search'}).click()
        cy.wait('@caseSearch')
        cy.findByRole('button', {name: 'Select Case'}).click()
        cy.wait(100)
        cy.findByLabelText('Case Name:').should('have.value', 'CRUD_case')
        // Delete the case
        cy.intercept('delete', '/cases/*').as('caseDelete')
        cy.findByRole('button', {name: 'Delete'}).click()
        cy.on('window:confirm', (str) => {
            expect(str).to.equal('Are you sure? This cannot be undone!')
            return true
        })
        cy.wait('@caseDelete')
        // Confirm delete with search returning no result
        cy.findByRole('textbox').type('CRUD')
        cy.findByRole('button', {name: 'Search'}).click()
        cy.wait('@caseSearch')
        cy.wait(1000)
        cy.findByText('CRUD_case').should('not.exist')
    })

    it('Start to Finish Workflow', () => {
        // Create the case
        cy.findByRole('link', {name: 'here'}).click()
        cy.findByLabelText('Forensicator:').clear()
        cy.findByLabelText('Forensicator:').type('Jessica Jones')
        cy.findByLabelText('Case Name:').clear()
        cy.findByLabelText('Case Name:').type('Alias Investigations')
        cy.findByRole('button', {name: 'Create'}).click()
        // Set Custodians
        cy.findByLabelText('Custodians').type('Denton')
        cy.findByRole('button', {name: 'Next'}).click()
        // Get certs
        cy.intercept('/sigs/upload/*').as('uploadSigPST')
        cy.intercept('post', '/sigs').as('sigsRun')
        cy.get('input[type=file]').selectFile('fixtures/TEST.pst')
        cy.findByRole('button', {name: 'Upload'}).click()
        cy.wait('@uploadSigPST')
        cy.findByRole('button', {name: 'Run'}).click()
        cy.wait('@sigsRun')
        cy.findByRole('certs').should('contain.text', cert)
        // Extract Keys
        cy.findByRole('link', {name: 'Extract Keys'}).click()
        cy.wait(500)
        cy.intercept('post', '/keys/*').as('keysRun')
        cy.get('input[type=file]').selectFile('fixtures/TEST.p12')
        cy.findByLabelText('Enter password for p12 file:').type('MrGlitter')
        cy.findByLabelText('Use a password manager to create a new password for the extacted key:').type('key-pw')
        cy.findByRole('button', {name: 'Upload'}).click()
        cy.wait('@keysRun')
        cy.findByText(keyfile).should('exist')
        // Decipher
        cy.findByRole('link', {name: 'Decipher'}).click()
        cy.wait(500)
        cy.intercept('/decipher/upload/pst/*').as('uploadCTPST')
        cy.get('input[type=file]').selectFile('fixtures/TEST.pst')
        cy.findByRole('button', {name: 'Upload'}).click()
        cy.wait('@uploadCTPST')
        cy.findByLabelText('Password').type('key-pw')
        cy.findByRole('button', {name: 'Run'}).click()
        cy.findByText('DONE!').should('exist')
    })
})