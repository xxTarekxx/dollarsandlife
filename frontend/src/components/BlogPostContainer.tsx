import styled from "styled-components";

const BlogPostContainer = styled.div`
	// display: flex;
	// flex-wrap: wrap;
	// justify-content: center;
	// max-width: 1280px;
	// margin: 12px 0px 12px 0px;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

export default BlogPostContainer;
