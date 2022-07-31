import Link from 'next/link'
import caseType from 'types/case'

const caseRows = (cases: caseType[]): JSX.Element[] => 
  cases.map(c => <tr key={c._id}>
    <td>{c.forensicator}</td>
    <td>{c.name}</td>
    <td>{c.dateCreated}</td>
    <td><Link href={`/${c._id}/editcase`}><button className='btn btn-primary'>Select Case</button></Link></td>
</tr>)
export default function ListCases({cases}: {cases: caseType[]}) {
  return(
    <table className='table'>
      <thead>
        <tr>
          <th scope='col'>Forensicator</th>
          <th scope='col'>Case Name</th>
          <th scope='col'>Date Created</th>
        </tr>
      </thead>
      <tbody>
        { cases ? caseRows(cases) : null }
      </tbody>
    </table>
  )
}