import {useState} from 'react'

export default function SearchBar({onSearch}) {
  const [searchCategory, setSearchCategory] = useState('forensicator')
  const [searchTerm, setSearchTerm] = useState('')
  return (
    <div className='card'>
      <form onSubmit={(e) => {e.preventDefault(); onSearch(searchCategory, searchTerm)}} className='form-inline'>
        <div className='input-group'>
          <div className='input-group-prepend'>
            <div className='input-group-text'>Search by:</div>
          </div>
          <select onChange={e => setSearchCategory(e.target.value)} value={searchCategory}>
            <option value='forensicator'>Forensicator</option>
            <option value='name'>Case name</option>
          </select>
        </div>
        <div className='input-group'>
          <input type='text' className='form-control' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button type='submit' className='btn btn-primary'>Search</button>
      </form>
    </div>
  )
}