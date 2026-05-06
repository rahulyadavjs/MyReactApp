
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import '@progress/kendo-theme-default/dist/all.css';
import { useEffect, useState } from "react";
import { process } from "@progress/kendo-data-query";

export default function KendoGrid(props) {
  const [dataState, setDataState] = useState({
        sort: [],
        filter: null,
        skip: 0,
        take: 10
    });
	
  return (
    <div className="App">
	
	<Grid  
  data={process(props.data, dataState)} 
  sortable={true}  
 
  filterable={true} 
  {...dataState}
                onDataStateChange={(e) => {
                    setDataState(e.dataState);
                }} 
  onRowClick={(e) => {
        console.log("Row clicked:", e.dataItem);
    }
    }>
                <GridColumn field="id" title="ID" width="80px" />
                <GridColumn field="name" title="Name" />
                <GridColumn field="email" title="Email" />
            </Grid>
    </div>
	
  );
}

