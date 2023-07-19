import React from 'react';

const Pagination = (props) => {
    const handlePageNumberClicked = (e) => {
		e.preventDefault();
        console.log(e.target.getAttribute('page_number'));
		props.handlePageNumberClicked(e.target.getAttribute('page_number'));
	}

    const handlePrevPageClicked = (e) => {
		e.preventDefault();
        props.handlePrevPageClicked();
    }

    const handleNextPageClicked = (e) => {
		e.preventDefault();
        props.handleNextPageClicked();
    }

    return <div className="main_table_pagination">
            <button 
				key={`${props.prefix}-page-number-prev`}
				className="btn btn_main_table_page_number btn-prev-page"
				onClick={handlePrevPageClicked}
				>
				&lsaquo;
			</button>
            {props.pageNumber > 1 &&
				<button 
					key={`${props.prefix}-page-number-1`}
					page_number={1}
					className={`btn btn_main_table_page_number`}
					onClick={handlePageNumberClicked}>
					{1}
				</button>
    		}

		    {props.pageNumber > 3 &&
				<button key={`${props.prefix}-page-number-dot1`} className="btn btn_main_table_page_number btn-prev-page">&hellip;</button>
            }

		    {props.pageNumber > 2 &&
				<button 
					key={`${props.prefix}-page-number-current-${props.pageNumber - 1}`}
					page_number={props.pageNumber - 1}
					className={`btn btn_main_table_page_number`}
					onClick={handlePageNumberClicked}>
					{props.pageNumber - 1}
				</button>
		    }

			<button 
				key={`${props.prefix}-page-number-current`}
				page_number={props.pageNumber}
				className={`btn btn_main_table_page_number active`}
				onClick={handlePageNumberClicked}>
				{props.pageNumber}
			</button>

		    {props.pageNumber < props.totalPage - 2 &&
				<button 
					key={`${props.prefix}-page-number-current-${props.pageNumber + 1}`}
					page_number={props.pageNumber + 1}
					className={`btn btn_main_table_page_number`}
					onClick={handlePageNumberClicked}>
					{props.pageNumber + 1}
				</button>
    		}

		    {props.pageNumber < props.totalPage - 1 &&
				<button key={`${props.prefix}-page-number-dot2`} className="btn btn_main_table_page_number btn-prev-page">&hellip;</button>
    		}

		    {props.pageNumber < props.totalPage &&
				<button 
					key={`${props.prefix}-page-number-max`}
					page_number={props.totalPage}
					className={`btn btn_main_table_page_number`}
					onClick={handlePageNumberClicked}>
					{props.totalPage}
				</button>
    		}

			<button 
				key={`${props.prefix}-page-number-next`}
				className="btn btn_main_table_page_number btn-next-page"
				onClick={handleNextPageClicked}
				>
				&rsaquo;
			</button>
        </div>
}

export default Pagination;