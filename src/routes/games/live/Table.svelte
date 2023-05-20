<script>
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { titleCase } from '../../../components/helpers';
    export let data = [];
    let handler;
    let rows;

    
    // Update handler and rows whenever the data prop changes
    $: {
      handler = new DataHandler(data, { rowsPerPage: 10 });
      rows = handler.getRows();
    }
  </script>
  
  {#if handler}
    <div class="container">
        <Datatable {handler}>
            <!-- Table headers -->
            <thead>
              <tr>
                {#each Object.keys(data[0]) as key}
                  <Th {handler} orderBy={key}>{titleCase(key)}</Th>
                {/each}
              </tr>
              <!-- Table filters -->
              <tr>
                {#each Object.keys(data[0]) as key}
                  <ThFilter {handler} filterBy={key} />
                {/each}        
              </tr>
            </thead>
            
            <!-- Table body -->
            <tbody>
              {#each $rows as row}
                <tr>
                  {#each Object.entries(row) as [key, value]}
                    <td>{value}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </Datatable>
    </div>
  {:else}
    <p>Loading...</p>
  {/if}
  

  <style>

    /* need to break up this page */
    table { 
    width: 100%; 
    border-collapse: collapse; 
  }
  /* Zebra striping */
  tr:nth-of-type(odd) { 
    background: #eee; 
  }
  th { 
    background: #333; 
    color: white; 
    font-weight: bold; 
  }
  td, th { 
    padding: 6px; 
    border: 1px solid #ccc; 
    text-align: left; 
  }
  
  @media 
  only screen and (max-width: 760px),
  (min-device-width: 768px) and (max-device-width: 1024px)  {
  
      /* Force table to not be like tables anymore */
      table, thead, tbody, th, td, tr { 
          display: block; 
      }
      
      /* Hide table headers (but not display: none;, for accessibility) */
      thead tr { 
          position: absolute;
          top: -9999px;
          left: -9999px;
      }
      
      tr { border: 1px solid #ccc; }
      
      td { 
          /* Behave  like a "row" */
          border: none;
          border-bottom: 1px solid #eee; 
          position: relative;
          padding-left: 50%; 
      }
      
      td:before { 
          /* Now like a table header */
          position: absolute;
          /* Top/left values mimic padding */
          top: 6px;
          left: 6px;
          width: 45%; 
          padding-right: 10px; 
          white-space: nowrap;
      }
      
      /*
      Label the data
      */
      td:nth-of-type(1):before { content: "Away Player"; }
      td:nth-of-type(2):before { content: "Home Player"; }
      td:nth-of-type(3):before { content: "Away Score"; }
      td:nth-of-type(4):before { content: "Home Score"; }
      td:nth-of-type(5):before { content: "Inning"; }
      td:nth-of-type(6):before { content: "Game Mode"; }
      td:nth-of-type(7):before { content: "Start Date"; }
      td:nth-of-type(8):before { content: "Away Stars"; }
      td:nth-of-type(9):before { content: "Home Stars"; }
      td:nth-of-type(10):before { content: "Arbitrary Data"; }
  }
  
  button a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  
  button {
    width: 50%;
    justify-content: center;
  }

  
  </style>