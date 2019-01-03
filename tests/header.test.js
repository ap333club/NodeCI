// const pup = require('puppeteer'); //no longer needed due to Page helper
// const sessionFactory = require('./factories/sessionFactory'); //no longer needed due to Page helper 
// const userFactory =  require('./factories/userFactory');//no longer needed due to Page helper
const Page = require('./helpers/page'); //our proxy

// let browser, page ; //no longer needed due to Page helper
let page;

beforeEach(async () => {
    // now wrapped up in Page
    // browser = await pup.launch({
    //     headless: false
    // });
    // page = await browser.newPage();

    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    console.log('close browser');
    // await browser.close();
    await page.close();
})

test('the header has the correct test', async () => {
    // const text = await page.$eval('a.brand-logo',
    //     el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo');    
    expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    console.log(url);
    expect(url).toMatch(/accounts\.google\.com/)
})

test('when signed in, shows logout button', async () => {
    //moved to page prototype
    // /const id = '5c1a8d73083e04040cbcca9b';
    // const user = await userFactory();
    // console.log(user);
    // const {session, sig} =  sessionFactory(user);

    // await page.setCookie({name:'session', value: session});
    // await page.setCookie({name:'session.sig', value: sig});
    // await page.goto('localhost:3000');
    // // need a wait 
    // await page.waitFor('a[href="/auth/logout"]');  

    await page.login();
    const text = await page.$eval('a[href="/auth/logout"]',
        el => el.innerHTML);
    expect(text).toEqual('Logout');
});


