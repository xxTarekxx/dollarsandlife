import styled from "styled-components";

const BlogPostContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	max-width: 1280px;
	margin: auto;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

export default BlogPostContainer;
