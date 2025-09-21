const axios = require('axios');

async function testFeedAPI() {
    try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDAzOTI3NDZmYTdlMDAxODYzMDNhOSIsImlhdCI6MTc1ODQ3NjgyOCwiZXhwIjoxNzU4NjQ5NjI4fQ.bravxUwhfp-aD8YsAeOUbICP_8ypnvGRgAd65b5XiLk";
        
        const contactIds = [
            "68d039341bffb8ca41c86ebb",
            "68d039341bffb8ca41c86ee0", 
            "68d039341bffb8ca41c86f08",
            "68d039341bffb8ca41c86f34",
            "68d039341bffb8ca41c86f62",
            "68d039341bffb8ca41c86f83",
            "68d039341bffb8ca41c86f9d",
            "68d039341bffb8ca41c86fbf",
            "68d039341bffb8ca41c86fe1",
            "68d039341bffb8ca41c8700a"
        ];

        const response = await axios.post('http://localhost:4000/api/v1/friends/feed/generate', {
            contactIds,
            filters: {}
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Success! Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.response?.status || 'Network Error');
        console.log('Error message:', error.response?.data?.message || error.message);
        console.log('Full error:', JSON.stringify(error.response?.data, null, 2));
    }
}

testFeedAPI();