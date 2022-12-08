import { useState, useEffect } from "react"
import { ethers } from "ethers"
import {Row, Col, Card, Button } from "reactstrap"
import React from 'react';

const Home = ({ marketplace, nft }) => {

    // this functions loads and stores marketplace items in the application state
    const [items, setItems] = useState([])
    const [loading, setLoading] =  useState(true)

    // Loading the marketplace items for end user to see on the home page
    const loadMarketplaceItems = async () => {

    // Fetch the itemsCount from the marketplace contract
    // Make an empty list of array items 
    // A for loop to check for every item creted on the marketplace
    // Using if statement to check if an item is unsold

        const itemCount = await marketplace.itemCount()
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.items(i)
            if (!item.sold) {
                // Get the URI url for each of the unsold NFTs from the nft contract
                const uri = await nft.tokenURI(item.tokenId)
                // Use the URI to fetch the nft metadata stored on ipfs(decentralized NFT storage )
                const response = await fetch(uri)
                const metadata = await response.json()
                // Get total price of an NFT item (item price + fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                // Add item to empty items array
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setItems(items)
        setLoading(false)    
    }

    // Buy NFT from the marketplace with the SC function purchaseItem  
    const buyMarketItem = async (item) => {
        await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
        loadMarketplaceItems()
    }

    // useEffect to reload market place items when an item is bought or page refreshed
    useEffect(() => {
        loadMarketplaceItems()
    }, []) 

     // return loading if page is loading 
    if (loading) return (
        <main style ={{ padding: "1rem 0"}}>
            <h2> Loading....</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
        {items.length > 0 ?
          <div className="px-5 container">
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {items.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          : (
            <main style={{ padding: "1rem 0" }}>
              <h2>No listed assets</h2>
            </main>
          )}
      </div>
    );
}
export default Home