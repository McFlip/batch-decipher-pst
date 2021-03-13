import Link from 'next/link'

interface caseType {
  status: 'active' | 'inactive',
  _id: string,
  name: string,
  forensicator: string,
  dateCreated: string
}
const caseRows = (cases: caseType[]): JSX.Element[] => 
  cases.map(c => <tr>
    <td>{c.forensicator}</td>
    <td>{c.name}</td>
    <td>{c.status}</td>
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
          <th scope='col'>Status</th>
          <th scope='col'>Date Created</th>
        </tr>
      </thead>
      <tbody>
        { cases ? caseRows(cases) : null }
      </tbody>
    </table>
  )
}