describe('SelectedItemsScreen', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
    });
  
    it('should display selected items and navigate back', async () => {
      await device.launchApp();
  
      const items = [
        {
          id: '1',
          owner: { login: 'user1', avatar_url: 'https://example.com/avatar1.png' },
          full_name: 'repo1',
          html_url: 'https://example.com/repo1',
          stargazers_count: 100,
        },
        {
          id: '2',
          owner: { login: 'user2', avatar_url: 'https://example.com/avatar2.png' },
          full_name: 'repo2',
          html_url: 'https://example.com/repo2',
          stargazers_count: 200,
        },
      ];
  
      for (const item of items) {
        await expect(element(by.text(item.owner.login))).toBeVisible();
        await expect(element(by.text(item.full_name))).toBeVisible();
        await expect(element(by.text(item.stargazers_count.toString()))).toBeVisible();
      }
  
      await element(by.id('Ok')).tap();
    });
  });