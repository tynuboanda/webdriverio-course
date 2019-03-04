var request = require('sync-request');

browser.addCommand("submitReview", function (email, review) {
    if (email) {
        //  Enter the email address
        browser.setValue("#review-email", email);
    }

    if (review) {
        //  Enter text in the comment form
        browser.setValue("#review-content", review);
    }

    // Submit the review
    browser.submitForm("#review-content");
})

describe('The product review form', function () {
  beforeEach(function() {
    //  Go to the product page
    browser.url("/product-page.html");
  })

  it('should add a review when submitted properly', function () {
    browser.submitReview("email@example.com", "This is the review")

    //  Assert that our review now appears in the list
    var hasReview = browser.isExisting(".comment=This is the review");

    expect(hasReview, "comment text exists").to.be.true;
  });
  it('should show an error message if the input is wrong', function () {
    // assert that error message isn't showing to start
    var isErrorShowing = browser.isVisible("p=There are some errors in your review.");
    expect(isErrorShowing).to.be.false;

    // submit form without entering content
    browser.submitReview();

    // assert that error message is now showing
    var isErrorShowing = browser.isVisible("p=There are some errors in your review.");
    expect(isErrorShowing).to.be.true;
  });
  it('should hide the error message when input is corrected', function () {
    // submit form without entering content
    browser.submitReview();

    // assert that error message is now showing
    var isErrorShowing = browser.isVisible("p=Please enter a valid email address.");
    expect(isErrorShowing).to.be.true;

    browser.submitReview("email@example.com");

    var isErrorShowing = browser.isVisible("p=Please enter a valid email address.");
    expect(isErrorShowing).to.be.false;

    browser.submitReview("email@example.com", "This is the review");

    var isMainErrorShowing = browser.isVisible("p=There are some errors in your review.");
    var isContentErrorShowing = browser.isVisible("p=A review without text isn't much of a review.");

    expect(isMainErrorShowing).to.be.false;
    expect(isContentErrorShowing).to.be.false;

  });
  it('should focus on the first invalid input field on error', function () {
    var emailHasFocus = browser.hasFocus("#review-email");
    expect(emailHasFocus, "email should not have focus").to.be.false;

    browser.submitReview();

    emailHasFocus = browser.hasFocus("#review-email");
    expect(emailHasFocus, "email should now have focus").to.be.true;

    browser.submitReview("email@example.com");

    var contentHasFocus = browser.hasFocus("#review-content");
    expect(contentHasFocus, "review content field should have focus").to.be.true;
  });

  it('should allow multiple reviews', function () {
    var res = request('GET', 'http://jsonplaceholder.typicode.com/posts/1/comments');

    var comments = JSON.parse(res.getBody().toString('utf8'));

    comments.forEach(function (comment, idx) {
        browser.submitReview(comment.email, comment.name);

        var email = browser.getText(".reviews > .comment:nth-of-type(" + (idx + 3) + ") .email");
        expect(email).to.equal(comment.email);

        var reviewText = browser.getText(".reviews > .comment:nth-of-type(" + (idx + 3) + ") .comment");
        expect(reviewText).to.equal(comment.name);
    })
  })
});