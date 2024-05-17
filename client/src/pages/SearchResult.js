import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import { dispPrice, dispListPrice, } from '../components/common';
import { CardGroup, Card, CardContent, CardHeader, Label, Menu, Dropdown,  } from 'semantic-ui-react';


function SearchResult() {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const { searchItems, onSetSearchItems } = useOutletContext();
    const [ sort, setSort ] = useState(1);
    const navigate = useNavigate();

    const sortOptions = [
        { key: 1, text: 'Featured', value: 1 },
        { key: 2, text: 'Price: Low to Hight', value: 2 },
        { key: 3, text: 'Price: High to Low', value: 3 },
        { key: 4, text: 'Avg. Customer Review', value: 4 },
    ];

    console.log('Before useEffect, searchParams: ', searchParams.get('query'));
    console.log('In SearchResult, searchItems: ', searchItems);

    useEffect(() => {
        console.log('searchParams: ', searchParams.get('query'));
        fetch(`/search/${searchParams.get('query')}`)
        .then(r => {
            r.json().then(data => {
                if (r.ok) {
                    console.log('In SearchResult, useEffect, searchItems: ', data)
                    onSetSearchItems(data)
                } else
                    console.log('Server error: ', data.message);
                    //add more actions here....
            })
        });
    }, [searchParams]);

    function handleNavigateItem(id) {
        navigate(`/items/${id}`);
    }

    let sortedItems;
    switch(sort) {
        case 2:
            sortedItems = searchItems.toSorted((item1, item2) => item1.discount_prices[item1.default_item_idx] - item2.discount_prices[item2.default_item_idx])
            break;
        case 3:
            sortedItems = searchItems.toSorted((item1, item2) => item2.discount_prices[item2.default_item_idx] - item1.discount_prices[item1.default_item_idx])
            break;
        case 4:
            // need to implement it after reviews feature is implemented. the following code is temporary.
            sortedItems = searchItems;
            break;
        default:
            sortedItems = searchItems;
            break;
    };

    const dispItemCards = sortedItems.map(item => 
        <Card key={item.id} style={{minWidth: '250px', }}>
            <div style={{width: '100%', height: '300px', 
                backgroundImage: `url(${item.card_thumbnail})`, 
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'center', }} 
                className='link' 
                onClick={() => handleNavigateItem(item.id)}
            />
            <CardContent>
                <CardHeader className='link' onClick={() => handleNavigateItem(item.id)}>{item.name}</CardHeader>
                <Label>
                    <span style={{fontSize: '1.2em',  fontWeight: 'bold', }}>
                        {
                            `${item.amounts[item.default_item_idx]} \
                            ${item.units[item.default_item_idx].charAt(0).toUpperCase() + item.units[item.default_item_idx].slice(1)} \
                            (Pack of ${item.packs[item.default_item_idx]})`
                        }
                    </span>
                </Label>
                <div className='link' onClick={() => handleNavigateItem(item.id)}>
                    {dispPrice(item, item.default_item_idx)}
                </div>
                <div className='link' onClick={() => handleNavigateItem(item.id)}>
                    {
                        item.prices[item.default_item_idx] !== item.discount_prices[item.default_item_idx] ?
                        <>
                            <span style={{marginRight: '5px', }}>List:</span>
                            {dispListPrice(item, item.default_item_idx)}
                        </> :
                        null
                    }
                </div>
            </CardContent>
        </Card>
    );


    return (
        <div style={{width: '100%', height: '100%', }}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',}}>
                <div>
                    <div style={{display: 'inline-block', fontSize: '1.2em', margin: '10px 0 10px 10px', }}>{searchItems.length} results for "</div>
                    <div style={{display: 'inline-block', fontSize: '1.2em', margin: '10px 10px 10px 0', 
                        fontWeight: 'bold', color: 'chocolate'}}>{searchParams.get('query')}"</div>
                </div>
                {/* <Menu compact size='tiny' style={{float: 'inline-end', }}> */}
                <Dropdown options={sortOptions} simple item button 
                    text='Dropdown' value={sort} onChange={(e, d) => setSort(d.value)} />
            </div>
            <hr style={{boxShadow: '0 2px 6px 1px lightgray'}}/>
            <div style={{ padding: '15px', width: '100%', height: '100%', }}>

                <div style={{fontSize: '1.5em', fontWeight: 'bold', margin: '5px 0', }}>Results</div>
                <div style={{fontSize: '1.1em', }}>Check each product page for other buying options.</div>
                <CardGroup itemsPerRow={5} style={{marginTop: '5px', }}>
                    {dispItemCards}
                </CardGroup>
            </div>
        </div>
    );
}

export default SearchResult;